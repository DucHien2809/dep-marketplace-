-- Consignments delete policy (run in Supabase SQL Editor)
-- Enables delete only for the user who created the consignment or admins

-- Ensure RLS is enabled
ALTER TABLE consignments ENABLE ROW LEVEL SECURITY;

-- Drop old policy if exists to avoid duplicates
DROP POLICY IF EXISTS "Allow owner or admin to delete consignments" ON consignments;

-- Create policy
CREATE POLICY "Allow owner or admin to delete consignments" ON consignments
    FOR DELETE
    USING (
        auth.uid() = user_id
        OR (
            (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        )
    );

-- Optional: restrict SELECT to approved for non-owners unless admin
-- Uncomment if desired
-- DROP POLICY IF EXISTS "Allow public read approved consignments" ON consignments;
-- CREATE POLICY "Allow public read approved consignments" ON consignments
--   FOR SELECT USING (
--     status = 'approved'
--     OR auth.uid() = user_id
--     OR ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
--   );
