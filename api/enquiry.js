const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  const method = (req.method || '').toUpperCase();
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Only POST requests are accepted.'
    });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    if (!body || typeof body !== 'object') {
      body = {};
    }

    // 1. Honeypot Spam Check
    if (body.website || body.b_address || body.fax_number) {
      return res.status(200).json({
        success: true,
        message: 'Your enquiry was submitted successfully.'
      });
    }

    // 2. Extract & Sanitize Input Fields
    const formType = sanitizeInput(body.form_type);
    const fullName = sanitizeInput(body.full_name || body.name);
    const email = sanitizeInput(body.email);
    const rawPhone = sanitizeInput(body.phone);
    const location = sanitizeInput(body.location);
    const companyName = sanitizeInput(body.company_name || body.business);
    const service = sanitizeInput(body.service);
    const budget = sanitizeInput(body.budget);
    const timeline = sanitizeInput(body.timeline || body.estimated_days);
    const message = sanitizeInput(body.message || body.comments);
    const pageUrl = sanitizeInput(body.page_url);

    // 3. Common Server-Side Validations
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

    // 4. Initialize Supabase Client via Strict Environment Variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
      console.error('[Enquiry API Error]: SUPABASE_URL or SUPABASE_SECRET_KEY environment variable is not configured.');
      return res.status(500).json({
        success: false,
        error: 'We could not save your enquiry. Please try again.'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseSecretKey);

    // 5. Secure Table Selection & Payload Construction
    let tableName;
    let payload;

    if (formType === 'contact') {
      tableName = 'contact_enquiries';

      if (!message) {
        return res.status(400).json({ success: false, error: 'Please describe your project requirements.' });
      }

      payload = {
        full_name: fullName,
        company_name: companyName || null,
        email: email,
        phone: cleanedPhone,
        location: location || null,
        message: message || null,
        page_url: pageUrl || null,
        status: 'new'
      };

    } else if (formType === 'quote') {
      tableName = 'quote_enquiries';

      if (!service) {
        return res.status(400).json({ success: false, error: 'Please select at least one expected service.' });
      }
      if (!budget) {
        return res.status(400).json({ success: false, error: 'Please enter your estimated budget.' });
      }
      if (!timeline) {
        return res.status(400).json({ success: false, error: 'Please select estimated timeframe / days.' });
      }

      payload = {
        full_name: fullName,
        company_name: companyName || null,
        email: email,
        phone: cleanedPhone,
        location: location || null,
        service: service || null,
        budget: budget || null,
        timeline: timeline || null,
        message: message || null,
        page_url: pageUrl || null,
        status: 'new'
      };

    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid form type.'
      });
    }

    // 6. Execute Supabase Insert
    const { data, error } = await supabase
      .from(tableName)
      .insert([payload])
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert failed:', {
        table: tableName,
        code: error.code,
        message: error.message,
        details: error.details
      });

      return res.status(500).json({
        success: false,
        error: 'We could not save your enquiry. Please try again.'
      });
    }

    // 7. Confirmed Success Response
    return res.status(201).json({
      success: true,
      enquiryId: data.id,
      message: 'Your enquiry was submitted successfully.'
    });

  } catch (err) {
    console.error('[Enquiry API Exception]:', err.message || err);
    return res.status(500).json({
      success: false,
      error: 'We could not save your enquiry. Please try again.'
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
  const re = /^(?:\+91|91)?[6-9]\d{9}$/;
  return re.test(phone);
}
