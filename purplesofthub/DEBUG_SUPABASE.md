# Debug: Supabase Schema Issues

Let's debug why the profiles table isn't being created. We'll use a step-by-step approach.

## Step 1: Check Current Database State

### 1.1 List All Tables
Run this query first in Supabase SQL Editor:

```sql
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
ORDER BY table_schema, table_name;
```

This will show us what tables currently exist in your database.

### 1.2 Check for profiles table specifically
```sql
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_name = 'profiles';
```

## Step 2: Create Tables Manually (Simplified)

If the full schema isn't working, let's create the essential tables one by one:

### 2.1 Create profiles table
```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2.2 Create projects table
```sql
-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  service_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  budget DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Clients can view own projects" ON projects FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "Clients can insert own projects" ON projects FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "Clients can update own projects" ON projects FOR UPDATE USING (client_id = auth.uid());
CREATE POLICY "Admins can view all projects" ON projects FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can insert projects" ON projects FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update all projects" ON projects FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2.3 Create function for automatic profile creation
```sql
-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'client');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## Step 3: Test the Setup

### 3.1 Verify tables exist
```sql
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_name IN ('profiles', 'projects')
ORDER BY table_schema, table_name;
```

### 3.2 Test profile creation
```sql
-- This should work after you create a user
SELECT * FROM profiles LIMIT 5;
```

## Step 4: If Still Having Issues

### 4.1 Check for syntax errors
Look at the exact error message when you run the schema. Common issues:
- Missing semicolons
- Incorrect function syntax
- Permission issues

### 4.2 Try running smaller chunks
Instead of the entire schema at once, run it in smaller sections:
1. First: Table definitions only
2. Second: RLS policies
3. Third: Functions and triggers

### 4.3 Check Supabase project settings
Ensure:
- You're in the correct Supabase project
- You have admin/database owner permissions
- The project is not in read-only mode

## Quick Test Script

Here's a minimal test to verify everything works:

```sql
-- Test 1: Check if profiles table exists
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_name = 'profiles';

-- Test 2: Try to insert a test profile (replace with actual user ID)
-- INSERT INTO profiles (id, email, full_name, role) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'test@example.com', 'Test User', 'client');

-- Test 3: Check RLS policies
SELECT policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policy 
WHERE tablename = 'profiles';
```

## Next Steps

1. **Run the debug queries** above and share the results
2. **Try the manual table creation** if the full schema still fails
3. **Check the exact error message** when running the schema
4. **Verify your Supabase project permissions**

Once we get the tables created, the 500 error should be resolved! 🎯