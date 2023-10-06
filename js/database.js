import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://bexcxoigkrcwpybuwpwy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJleGN4b2lna3Jjd3B5YnV3cHd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTM4NDc5NTIsImV4cCI6MjAwOTQyMzk1Mn0.eGIj4DU57L8bEQvjtETsvxAoVbu8AquqHsGiSm0CkTY'
const supabase = createClient(supabaseUrl, supabaseKey)
console.log(supabase)

const response = await supabase.auth.getSession();
console.log(response)
if ( response.data.session ) '';
else { window.location.href = window.location.origin + '/login'; };


const user = await supabase.from('player').select().eq('id', response.data.session.user.id);
// console.log(user);


// GET SESSION VOOR WACHTWOORD RESET
const getResetPwSession = async () => {
    const response = await _supabase.auth.getSession()
    // console.log(response.data.session.user.email);
    if (response.data.session) dmx.app.set('email', response.data.session.user.email);
    else dmx.parse('nocred.show()');
}


// LOG USER IN
