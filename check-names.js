const fs = require('fs');
fetch('https://zmvrnkfqldoijnlryhwo.supabase.co/rest/v1/profiles?select=display_name', {
  headers: {
    apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptdnJua2ZxbGRvaWpubHJ5aHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NTU3NDMsImV4cCI6MjEwMjEzMTc0M30.u_dAPYYyvv8h8BEQm5uFLmXgbhEg3iqScx0LzTq6uAs'
  }
}).then(r=>r.json()).then(data => {
  console.log(JSON.stringify(data, null, 2));
});
