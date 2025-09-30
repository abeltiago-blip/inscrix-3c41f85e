-- Clean up data for organizador@inscrix.pt and participante@inscrix.pt users
-- This will remove all related data so the auth users can be deleted manually

-- Step 1: Delete orders (which reference users and events)
DELETE FROM orders WHERE user_id IN (
  SELECT user_id FROM profiles 
  WHERE email IN ('organizador@inscrix.pt', 'participante@inscrix.pt')
);

-- Step 2: Delete registrations 
DELETE FROM registrations WHERE user_id IN (
  SELECT user_id FROM profiles 
  WHERE email IN ('organizador@inscrix.pt', 'participante@inscrix.pt')
) OR participant_email IN ('organizador@inscrix.pt', 'participante@inscrix.pt');

-- Step 3: Delete ticket types for events created by the organizer
DELETE FROM ticket_types WHERE event_id IN (
  SELECT id FROM events 
  WHERE organizer_id IN (
    SELECT user_id FROM profiles WHERE email = 'organizador@inscrix.pt'
  )
);

-- Step 4: Delete events created by the organizer
DELETE FROM events WHERE organizer_id IN (
  SELECT user_id FROM profiles WHERE email = 'organizador@inscrix.pt'
);

-- Step 5: Delete user profiles
DELETE FROM profiles WHERE email IN ('organizador@inscrix.pt', 'participante@inscrix.pt');