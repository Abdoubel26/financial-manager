CREATE TYPE "public"."type" AS ENUM('expense', 'income', 'transfer');--> statement-breakpoint
CREATE TABLE "totals_histories" (
	"balance" integer NOT NULL,
	"date" timestamp DEFAULT now(),
	"user_id" uuid,
	"transaction_id" uuid,
	CONSTRAINT "totals_histories_transaction_id_user_id_pk" PRIMARY KEY("transaction_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" varchar,
	"date" timestamp DEFAULT now() NOT NULL,
	"type" "type" NOT NULL,
	"amount" integer NOT NULL,
	"category" varchar,
	"user_id" uuid,
	"balance" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar NOT NULL,
	"image" varchar
);
--> statement-breakpoint
ALTER TABLE "totals_histories" ADD CONSTRAINT "totals_histories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "totals_histories" ADD CONSTRAINT "totals_histories_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_categories_name_fk" FOREIGN KEY ("category") REFERENCES "public"."categories"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;