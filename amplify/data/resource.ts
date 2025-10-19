import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user can "create", "read", "update", and "delete" any
"Todo" records.
=========================================================================*/
const schema = a.schema({
  Expense: a
    .model({
      id: a.id().required(),
      amount: a.float().required(),
      description: a.string().required(),
      payer: a.string().required(),
      groupId: a.string().required(),
      timestamp: a.datetime().required(),
      category: a.string(),
      splitBetween: a.string().array().required(),
      settled: a.boolean().default(false),
    })
    .authorization((allow) => [
      allow.authenticated().to(['create', 'read', 'update', 'delete']),
    ]),
  
  Roommate: a
    .model({
      id: a.id().required(),
      name: a.string().required(),
      email: a.string().required(),
      groupId: a.string().required(),
      balance: a.float().default(0),
    })
    .authorization((allow) => [
      allow.authenticated().to(['create', 'read', 'update', 'delete']),
    ]),
    
  Group: a
    .model({
      id: a.id().required(),
      name: a.string().required(),
      members: a.string().array().required(),
      createdAt: a.datetime().required(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['create', 'read', 'update', 'delete']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Components or Pages Router? Review how to generate Data clients for those 
specific frameworks: https://docs.amplify.aws/react/build-a-backend/data/connect-to-API
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests

// For example, this will fetch all todos
const { data: todos } = await client.models.Expense.list()
*/

/*== STEP 3 ===============================================================
Fetch remote data. When you build a full-stack app, you'll typically
want to fetch data from your backend. Here's how you can do that:

// For example, this will fetch all todos
const { data: todos } = await client.models.Expense.list()
=========================================================================*/