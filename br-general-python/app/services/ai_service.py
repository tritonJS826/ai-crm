"""
Service for AI-assisted message drafting.

TODO: Implement actual OpenAI/LLM integration when API key is available.
"""

import logging
from typing import List, Optional

from app.settings import settings

logger = logging.getLogger(__name__)

# Canned prompt templates for quick responses
CANNED_PROMPTS = {
    "apologize": "Apologize sincerely and ask for order number to help resolve the issue.",
    "thank_you": "Thank the customer for their message and confirm you'll assist shortly.",
    "order_status": "Ask for the order number to check the status.",
    "product_info": "Provide helpful information about the product they're asking about.",
    "closing": "Thank them for reaching out and wish them a great day.",
}


class AIService:
    """
    Service for generating AI-drafted message responses.

    NOTE: This is a TODO placeholder. Actual OpenAI integration
    will be implemented when OPENAI_API_KEY is configured.
    """

    def __init__(self) -> None:
        self.api_key = settings.openai_api_key
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

    def _format_messages(self, messages: List[dict]) -> List[dict]:
        """Format messages for OpenAI API."""
        formatted = []
        for msg in messages:
            role = "assistant" if msg.get("direction") == "OUT" else "user"
            content = msg.get("text", "")
            if content:
                formatted.append({"role": role, "content": content})
        return formatted

    def get_canned_prompts(self) -> dict:
        """Return available canned prompt options."""
        return CANNED_PROMPTS.copy()


ai_service = AIService()
