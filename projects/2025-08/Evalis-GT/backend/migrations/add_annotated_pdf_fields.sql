-- Migration to add annotated PDF fields to submissions table
ALTER TABLE "Submissions" 
ADD COLUMN "gradedFileUrl" VARCHAR(255),
ADD COLUMN "annotations" TEXT;

-- Add comment for documentation
COMMENT ON COLUMN "Submissions"."gradedFileUrl" IS 'URL to the annotated/graded PDF file';
COMMENT ON COLUMN "Submissions"."annotations" IS 'JSON string containing PDF annotations data';
