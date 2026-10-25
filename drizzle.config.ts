//DONT FORGET TO LOAD env variables
import { defineConfig } from 'drizzle-kit';


//Configured for PostgreSQL with Neon
export default defineConfig({
    dialect:"postgresql",
        schema:"./src/db/schema.ts",
        out:"./drizzle",
        dbCredentials:{
            url:process.env.DATABASE_URL!,
        },
        strict:true,
        verbose:true,

    });