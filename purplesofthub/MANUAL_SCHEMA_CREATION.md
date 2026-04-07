
# Manual Schema Creation - Step by Step

Since the full schema isn't working, let's create the essential tables manually. Run these queries one by one in your Supabase SQL Editor.

## Step 1: Create the profiles table

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

**After running this, verify it worked:**
```sql
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_name = 'profiles';
```

## Step 2: Create the projects table

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

**Verify projects table:**
```sql
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_name = 'projects';
```

## Step 3: Create automatic profile creation function

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

## Step 4: Verify everything works

```sql
-- Check if both tables exist
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_name IN ('profiles', 'projects')
ORDER BY table_schema, table_name;

-- Check RLS policies for profiles
SELECT policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policy 
WHERE tablename = 'profiles';

-- Check RLS policies for projects
SELECT policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policy 
WHERE tablename = 'projects';
```

## Step 5: Test the setup

Once you've created these tables, try:

1. **Create a test user** in Supabase → Authentication → Users
2. **Check if profile was created**:
   ```sql
   SELECT * FROM profiles LIMIT 5;
   ```
3. **Test your application** - the 500 error should be gone!

## If You Get Errors

**Common issues and fixes:**

1. **"Function already exists"**: Drop and recreate:
   ```sql
   DROP FUNCTION IF EXISTS update_updated_at_column();
   DROP FUNCTION IF EXISTS handle_new_user();
   ```

2. **"Table already exists"**: Drop and recreate:
   ```sql
   DROP TABLE IF EXISTS projects CASCADE;
   DROP TABLE IF EXISTS profiles CASCADE;
   ```

3. **"Permission denied"**: Make sure you're running as a database owner/admin

4. **"Syntax error"**: Check for missing semicolons or quotes

## Next Steps

Once these tables are created:
1. **Test your application** - it should work now!
2. **If you need more tables** (invoices, files, etc.), let me know and I'll provide the SQL
3. **Set up your Vercel environment variables** if not done already

**Let me know after you run each step and if you encounter any errors!** 🎯