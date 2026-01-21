"""
Service for AI-assisted message drafting.

"""

from app.logging import logger
from typing import List, Optional

from app.settings import settings

from openai import OpenAI

# Canned prompt templates for quick responses
CANNED_PROMPTS = {
    "apologize": "Apologize sincerely and ask for order number to help resolve the issue.",
    "thank_you": "Thank the customer for their message and confirm you'll assist shortly.",
    "order_status": "Ask for the order number to check the status.",
    "product_info": "Provide helpful information about the product they're asking about.",
    "closing": "Thank them for reaching out and wish them a great day.",
}


class AISuggestionError(RuntimeError):
    pass


class AIService:
    """
    Service for generating AI-drafted message responses.

    """

    def __init__(self, api_key: str | None) -> None:
        self.api_key = api_key
        self.is_configured = bool(self.api_key)

    async def generate_draft(
        self,
        messages: List[dict],
        style: Optional[str] = None,
    ) -> Optional[str]:
        """
        Generate a draft response based on conversation history.

        Args:
            messages: List of recent messages with 'direction' and 'text' keys
            style: Optional canned prompt style key

        Returns:
            Draft response text, or None if AI is not configured
        """
        if not self.is_configured:
            logger.warning("AI service not configured: OPENAI_API_KEY not set")
            return self._get_fallback_response(style)

        # TODO: Implement actual OpenAI API call
        #
        # Example implementation (when ready):
        #
        # import openai
        # openai.api_key = self.api_key
        #
        # system_prompt = self._build_system_prompt(style)
        # conversation = self._format_messages(messages)
        #
        # response = await openai.ChatCompletion.acreate(
        #     model="gpt-4o-mini",
        #     messages=[
        #         {"role": "system", "content": system_prompt},
        #         *conversation,
        #     ],
        #     max_tokens=500,
        #     timeout=10,
        # )
        #
        # return response.choices[0].message.content

        return self._get_fallback_response(style)

    def _get_fallback_response(self, style: Optional[str] = None) -> str:
        """Return a fallback response when AI is not available."""
        if style and style in CANNED_PROMPTS:
            # Return instruction text for manual editing
            return f"[AI TODO] {CANNED_PROMPTS[style]}"

        return "[AI TODO] Please compose a helpful response to the customer."

    def _fallback_suggestions(self, limit: int) -> list[str]:
        return [
            "Thanks for reaching out! Could you please provide more details?",
            "I understand. Let me check this for you and get back shortly.",
            "Would you like help proceeding with the next step?",
        ][:limit]

    def _build_system_prompt(self, style: Optional[str] = None) -> str:
        """Build system prompt for the AI model."""
        base_prompt = (
            "You are a helpful customer service agent. "
            "Respond professionally and concisely. "
            "Be friendly but not overly casual."
        )

        if style and style in CANNED_PROMPTS:
            base_prompt += f"\n\nInstruction: {CANNED_PROMPTS[style]}"

        return base_prompt

    def _format_messages(self, messages: list[dict]) -> list[dict]:
        """
        Build AI conversation context:
        - Keep ALL customer messages
        - Keep ONLY the LAST assistant message
        - Strongly anchor the latest customer intent
        """

        formatted: list[dict] = []

        last_assistant_message = None
        customer_messages: list[str] = []

        for msg in messages:
            text = (msg.get("text") or "").strip()
            if not text:
                continue

            if msg.get("direction") == "OUT":
                last_assistant_message = text
            else:
                customer_messages.append(text)

        # Add earlier customer messages (light context)
        for t in customer_messages[:-1]:
            formatted.append(
                {
                    "role": "user",
                    "content": f"Earlier customer message:\n{t}",
                }
            )

        # Add last assistant reply (if any)
        if last_assistant_message:
            formatted.append(
                {
                    "role": "assistant",
                    "content": last_assistant_message,
                }
            )

        # Add latest customer intent (STRONG anchor)
        if customer_messages:
            formatted.append(
                {
                    "role": "user",
                    "content": (
                        "MOST RECENT CUSTOMER INTENT (this is what you must respond to):\n"
                        f"{customer_messages[-1]}"
                    ),
                }
            )

        return formatted

    def get_canned_prompts(self) -> dict:
        """Return available canned prompt options."""
        return CANNED_PROMPTS.copy()

    async def generate_agent_suggestions(
        self,
        messages: List[dict],
        max_suggestions: int = 5,
    ) -> List[str]:
        """
        Generate multiple agent reply suggestions based on full conversation.
        """
        if not self.is_configured:
            logger.warning("AI not configured, using fallback suggestions")
            return self._fallback_suggestions(max_suggestions)

        SYSTEM_PROMPT = """
        You are an experienced sales assistant.

        Context:
        - You are replying to an existing conversation with a customer.
        - You have access to the full chat history.
        - The customer is already engaged.

        Your goal:
        - Help the customer buy what they want.
        - Move the conversation toward a purchase or clear next step.

        Rules:
        - Read the FULL conversation before answering.
        - Focus on the customer's most recent intent.
        - Use earlier messages to be more specific (preferences, quantity, use case).
        - Do NOT greet the customer.
        - Do NOT ask generic questions like "How can I help?"
        - Be concise, confident, and sales-oriented.
        - Suggest next steps: quantity, options, pricing, or checkout.

        Output:
        - Generate 1 to 2 alternative reply suggestions.
        - Each suggestion must be ready to send as-is.
        - Return one suggestion per line.
        """

        conversation = self._format_messages(messages)

        client = OpenAI(api_key=self.api_key)

        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    *conversation,
                ],
                temperature=0.4,
            )
        except TimeoutError as e:
            raise AISuggestionError("LLM timeout") from e

        text = response.choices[0].message.content or ""
        lines = [line.strip("-• ").strip() for line in text.split("\n") if line.strip()]

        return lines[:max_suggestions]


ai_service = AIService(settings.openai_api_key)
