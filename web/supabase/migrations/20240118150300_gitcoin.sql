CREATE SCHEMA indexing;
GRANT USAGE ON SCHEMA indexing TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA indexing TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA indexing TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA indexing TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA indexing GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA indexing GRANT ALL ON ROUTINES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA indexing GRANT ALL ON SEQUENCES TO service_role;

create table "indexing"."gitcoin_projects" (
    "id" text not null,
    "created_at" timestamp with time zone not null default now(),
    "data" json not null,
    "protocol" int not null,
    "pointer" text not null,
    PRIMARY KEY ("id")
);
ALTER TABLE "indexing"."gitcoin_projects" OWNER TO "postgres";
ALTER TABLE "indexing"."gitcoin_projects" enable row level security;

create table "indexing"."gitcoin_applications" (
    "id" text not null,
    "created_at" int not null,
    "data" json not null,
    "protocol" int not null,
    "pointer" text not null,
    "round_id" text not null,
    "project_id" text not null,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("project_id") REFERENCES "indexing"."gitcoin_projects"("id") ON DELETE CASCADE
);
ALTER TABLE "indexing"."gitcoin_applications" OWNER TO "postgres";
ALTER TABLE "indexing"."gitcoin_applications" enable row level security;

create table "indexing"."gitcoin_indexing_jobs" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "url" text not null,
    "network_id" int not null,
    "is_running" boolean not null default false,
    "skip_rounds" int not null default 0,
    "skip_projects" int not null default 0,
    "last_updated_at" timestamp with time zone not null default now(),
    "is_failed" boolean not null default false,
    "error" text null,
    PRIMARY KEY ("id")
);
ALTER TABLE "indexing"."gitcoin_indexing_jobs" OWNER TO "postgres";
ALTER TABLE "indexing"."gitcoin_indexing_jobs" enable row level security;

insert into "indexing"."gitcoin_indexing_jobs" ("url", "network_id") values 
    ('https://api.thegraph.com/subgraphs/name/allo-protocol/grants-round-polygon', 137), 
    ('https://api.thegraph.com/subgraphs/name/vacekj/allo-mainnet', 1),
    ('https://api.thegraph.com/subgraphs/name/gitcoinco/gitcoin-grants-arbitrum-one', 42161),
    ('https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-optimism-mainnet', 10),
    ('https://api.studio.thegraph.com/query/45391/grants-round-base/v0.0.1', 8453),
    ('https://api.studio.thegraph.com/query/45391/grants-round-zkera/v0.0.2', 324),
    ('https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-avalanche-mainnet', 43114),
    ('https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-fantom-mainnet', 250);
