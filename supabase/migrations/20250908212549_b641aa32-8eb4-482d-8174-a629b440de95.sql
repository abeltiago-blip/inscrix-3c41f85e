-- Create storage buckets for event files
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('event-images', 'event-images', true),
  ('event-documents', 'event-documents', false);

-- Create policies for event images bucket (public read, organizer write)
CREATE POLICY "Event images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'event-images');

CREATE POLICY "Organizers can upload event images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'event-images' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM events 
    WHERE events.organizer_id = auth.uid() 
    AND events.id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Organizers can update their event images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'event-images' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM events 
    WHERE events.organizer_id = auth.uid() 
    AND events.id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Organizers can delete their event images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'event-images' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM events 
    WHERE events.organizer_id = auth.uid() 
    AND events.id::text = (storage.foldername(name))[1]
  )
);

-- Create policies for event documents bucket (private)
CREATE POLICY "Event documents are accessible to participants" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'event-documents' 
  AND (
    -- Organizers can see their event documents
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.organizer_id = auth.uid() 
      AND events.id::text = (storage.foldername(name))[1]
    )
    OR
    -- Registered participants can see event documents
    EXISTS (
      SELECT 1 FROM events e
      JOIN registrations r ON r.event_id = e.id
      WHERE e.id::text = (storage.foldername(name))[1]
      AND r.participant_id = auth.uid()
    )
  )
);

CREATE POLICY "Organizers can upload event documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'event-documents' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM events 
    WHERE events.organizer_id = auth.uid() 
    AND events.id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Organizers can update their event documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'event-documents' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM events 
    WHERE events.organizer_id = auth.uid() 
    AND events.id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Organizers can delete their event documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'event-documents' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM events 
    WHERE events.organizer_id = auth.uid() 
    AND events.id::text = (storage.foldername(name))[1]
  )
);