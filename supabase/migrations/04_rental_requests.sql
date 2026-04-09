-- Create a generic function to update the updated_at column
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create rental_requests table
CREATE TABLE public.rental_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rental_id UUID NOT NULL REFERENCES public.equipment_rentals(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security
ALTER TABLE public.rental_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert requests where they are the requester
CREATE POLICY "Users can insert their own rental requests"
ON public.rental_requests FOR INSERT
WITH CHECK (auth.uid() = requester_id);

-- Policy: Users can view requests if they are the requester OR the owner
CREATE POLICY "Users can view their own requests and requests for their equipment"
ON public.rental_requests FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = owner_id);

-- Policy: Owners can update requests (to accept/reject) and requesters can update (to cancel)
CREATE POLICY "Owners can update requests"
ON public.rental_requests FOR UPDATE
USING (auth.uid() = owner_id OR auth.uid() = requester_id)
WITH CHECK (auth.uid() = owner_id OR auth.uid() = requester_id);

-- Auto-update updated_at timestamp
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.rental_requests
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();
