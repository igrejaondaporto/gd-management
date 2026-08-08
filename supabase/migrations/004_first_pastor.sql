-- Run this in Supabase SQL Editor to approve the first pastor
-- Replace YOUR_EMAIL with the email you used to log in

-- Find your profile
select id, email, status, role from profiles where email = 'YOUR_EMAIL';

-- Approve as pastor (replace ID from the query above)
-- update profiles set status = 'approved', role = 'pastor' where id = 'YOUR_ID';
