import express from "express"
import prisma from "./prisma" // importing the prisma instance we created.
import { graphqlHTTP } from 'express-graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

// eslint-disable-next-line no-new-func
const importDynamic = new Function('modulePath', 'return import(modulePath)');

const fetch = async (...args:any[]) => {
  const module = await importDynamic('node-fetch');
  return module.default(...args);
};

type Cat = {
    id: number,
    name: string
}


type Categories = {
    trivia_categories: [Cat]
}



const app = express()
app.use(express.json())

const PORT = process.env.PORT || 3000



const typeDefs = `
  type User {
    name: String!
  }
  
  type Query {
    allUsers: [User!]!
  }
`;

const resolvers = {
    Query: {
        allUsers: () => {
            return prisma.user.findMany();
        }
    }
};

export const schema = makeExecutableSchema({
    resolvers,
    typeDefs,
});

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true,
}));

app.get('/categories', async (req, res) => {
    try {
        const response = await fetch('https://opentdb.com/api_category.php');
        const categories = await response.json();
        res.send((categories as Categories).trivia_categories);
    } catch (err) {
        res.status(500).send(err);
    }
});

// app.get('/categories', (req, res) => {
//     fetch('https://opentdb.com/api_category.php')
//       .then(response => response.json())
//       .then(json => res.send(json))
  
//   })

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))

//hello

export default app;