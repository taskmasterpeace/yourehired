import { supabase } from './supabase';

// Save user opportunities
export const saveUserOpportunities = async (userId, opportunities) => {
  // First check if the user already has opportunities saved
  const { data, error: fetchError } = await supabase
    .from('user_opportunities')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (fetchError && fetchError.code !== 'PGRST116') {
    // PGRST116 means no rows returned, which is fine for a new user
    throw fetchError;
  }
  
  if (data) {
    // Update existing record
    const { error } = await supabase
      .from('user_opportunities')
      .update({ 
        opportunity_data: opportunities,
        updated_at: new Date()
      })
      .eq('user_id', userId);
    
    if (error) throw error;
  } else {
    // Insert new record
    const { error } = await supabase
      .from('user_opportunities')
      .insert({ 
        user_id: userId,
        opportunity_data: opportunities,
        created_at: new Date(),
        updated_at: new Date()
      });
    
    if (error) throw error;
  }
};

// Get user opportunities
export const getUserOpportunities = async (userId) => {
  const { data, error } = await supabase
    .from('user_opportunities')
    .select('opportunity_data')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data ? data.opportunity_data : [];
};

// Save user resume
export const saveUserResume = async (userId, resume) => {
  const { data, error: fetchError } = await supabase
    .from('user_resumes')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
  
  if (data) {
    const { error } = await supabase
      .from('user_resumes')
      .update({ 
        resume_data: resume,
        updated_at: new Date()
      })
      .eq('user_id', userId);
    
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('user_resumes')
      .insert({ 
        user_id: userId,
        resume_data: resume,
        created_at: new Date(),
        updated_at: new Date()
      });
    
    if (error) throw error;
  }
};

// Get user resume
export const getUserResume = async (userId) => {
  const { data, error } = await supabase
    .from('user_resumes')
    .select('resume_data')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data ? data.resume_data : '';
};

// Save user events
export const saveUserEvents = async (userId, events) => {
  const { data, error: fetchError } = await supabase
    .from('user_events')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
  
  if (data) {
    const { error } = await supabase
      .from('user_events')
      .update({ 
        event_data: events,
        updated_at: new Date()
      })
      .eq('user_id', userId);
    
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('user_events')
      .insert({ 
        user_id: userId,
        event_data: events,
        created_at: new Date(),
        updated_at: new Date()
      });
    
    if (error) throw error;
  }
};

// Get user events
export const getUserEvents = async (userId) => {
  const { data, error } = await supabase
    .from('user_events')
    .select('event_data')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data ? data.event_data : [];
};
