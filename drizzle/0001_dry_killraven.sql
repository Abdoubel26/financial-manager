ALTER TABLE "totals_histories" DROP CONSTRAINT "totals_histories_transaction_id_transactions_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."type";--> statement-breakpoint
CREATE TYPE "public"."type" AS ENUM('expense', 'income');--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "type" SET DATA TYPE "public"."type" USING "type"::"public"."type";--> statement-breakpoint
ALTER TABLE "totals_histories" ADD CONSTRAINT "totals_histories_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;