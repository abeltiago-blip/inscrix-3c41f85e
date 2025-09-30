-- Delete the duplicate event that has no registrations or orders
DELETE FROM ticket_types WHERE event_id = '3e5ac0d9-bc37-4fdd-aeaf-0bdd2515dca8';
DELETE FROM events WHERE id = '3e5ac0d9-bc37-4fdd-aeaf-0bdd2515dca8';