const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Only POST requests are accepted.'
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};

    // 1. Honeypot Spam Check
    if (body.website || body.b_address || body.fax_number) {
      // Silent rejection for bot submissions
      return res.status(200).json({
        success: true,
        message: 'Your enquiry was submitted successfully.'
      });
    }

    // 2. Validate Form Type
    const formType = sanitizeInput(body.form_type);
    if (!formType || (formType !== 'contact' && formType !== 'quote')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid enquiry submission form type.'
      });
    }

    // 3. Extract & Sanitize Input Fields
    const fullName = sanitizeInput(body.full_name || body.name);
    const email = sanitizeInput(body.email);
    const rawPhone = sanitizeInput(body.phone);
    const location = sanitizeInput(body.location);
    const companyName = sanitizeInput(body.company_name || body.business);
    const service = sanitizeInput(body.service);
    const budget = sanitizeInput(body.budget);
    const timeline = sanitizeInput(body.timeline || body.estimated_days);
    const subject = sanitizeInput(body.subject);
    const message = sanitizeInput(body.message || body.comments);
    const pageUrl = sanitizeInput(body.page_url);

    // 4. Server-Side Validations
    if (!fullName) {
      return res.status(400).json({ success: false, error: 'Full name is required.' });
    }
    if (fullName.length > 150) {
      return res.status(400).json({ success: false, error: 'Full name exceeds 150 characters limit.' });
    }

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
    }
    if (email.length > 150) {
      return res.status(400).json({ success: false, error: 'Email address exceeds 150 characters limit.' });
    }

    if (!rawPhone) {
      return res.status(400).json({ success: false, error: 'Phone / WhatsApp number is required.' });
    }
    const cleanedPhone = rawPhone.replace(/[^\d+]/g, '');
    if (!validateIndianPhone(cleanedPhone)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit Indian phone or WhatsApp number.' });
    }
    if (cleanedPhone.length > 30) {
      return res.status(400).json({ success: false, error: 'Phone number exceeds 30 characters limit.' });
    }

    // Optional Field Length Restrictions
    if (location && location.length > 150) {
      return res.status(400).json({ success: false, error: 'Location exceeds 150 characters limit.' });
    }
    if (companyName && companyName.length > 150) {
      return res.status(400).json({ success: false, error: 'Company name exceeds 150 characters limit.' });
    }
    if (service && service.length > 1000) {
      return res.status(400).json({ success: false, error: 'Service selection text exceeds length limit.' });
    }
    if (budget && budget.length > 100) {
      return res.status(400).json({ success: false, error: 'Budget field exceeds length limit.' });
    }
    if (timeline && timeline.length > 100) {
      return res.status(400).json({ success: false, error: 'Timeline field exceeds length limit.' });
    }
    if (subject && subject.length > 200) {
      return res.status(400).json({ success: false, error: 'Subject line exceeds length limit.' });
    }
    if (message && message.length > 3000) {
      return res.status(400).json({ success: false, error: 'Message content exceeds 3000 characters limit.' });
    }

    // 5. Initialize Supabase Client via Environment Variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
      console.error('[Enquiry API Error]: Supabase environment variables missing in server environment.');
      return res.status(500).json({
        success: false,
        error: 'Database connection parameters missing. Please notify system administrator.'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseSecretKey);

    // 6. Insert Enquiry Row into Supabase Table 'enquiries'
    const payload = {
      form_type: formType,
      full_name: fullName,
      email: email,
      phone: cleanedPhone,
      location: location || null,
      company_name: companyName || null,
      service: service || null,
      budget: budget || null,
      timeline: timeline || null,
      subject: subject || null,
      message: message || null,
      preferred_contact: 'whatsapp',
      page_url: pageUrl || null,
      status: 'new',
      notification_sent: false
    };

    const { data, error } = await supabase
      .from('enquiries')
      .insert([payload])
      .select();

    if (error) {
      console.error('[Enquiry API Error]: Supabase Insert Error:', error.message || error);
      return res.status(500).json({
        success: false,
        error: 'Unable to save enquiry at this moment. Please reach us directly via WhatsApp.'
      });
    }

    // 7. Success Response
    return res.status(200).json({
      success: true,
      message: 'Your enquiry was submitted successfully.'
    });

  } catch (err) {
    console.error('[Enquiry API Exception]:', err.message || err);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred. Please try again or chat with us on WhatsApp.'
    });
  }
};

function sanitizeInput(val) {
  if (typeof val !== 'string') return '';
  return val.replace(/<[^>]*>?/gm, '').trim();
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validateIndianPhone(phone) {
  // Allows +91 / 91 prefix or 10-digit Indian numbers starting with 6-9
  const re = /^(?:\+91|91)?[6-9]\d{9}$/;
  return re.test(phone);
}
