import {env} from 'src/config/env';
import {prisma} from 'src/db/prisma';
import express, {Express, Request, Response} from 'express';

const CODE_500 = 500;

const app: Express = express();
app.use(express.json());
const port = env.SERVER_PORT;

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.post('/users', async (req: Request, res: Response) => {
  try {
    const {email, name} = req.body;
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: 'test',
      },
    });
    res.json(user);
  } catch (error) {
    res.status(CODE_500).json({error});
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
