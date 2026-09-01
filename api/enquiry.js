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

    // 2. Validate Form Type
    const formType = sanitizeInput(body.form_type);
    if (!formType || (formType !== 'contact' && formType !== 'quote')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid enquiry submission form type.'
      });
    }

    // 3. Extract & Sanitize Common Input Fields
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

    // 4. Validate Common Required Fields (Full Name, Email, Phone)
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

    // 5. Initialize Supabase Client via Environment Variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
      console.error('[Enquiry API Error]: SUPABASE_URL or SUPABASE_SECRET_KEY environment variable is missing.');
      return res.status(500).json({
        success: false,
        error: 'We could not save your enquiry. Please try again.'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseSecretKey);

    // 6. Branch Logic & Table Selection Based on Form Type
    if (formType === 'contact') {
      // Contact Form Specific Validations
      if (!message) {
        return res.status(400).json({ success: false, error: 'Please describe your project requirements.' });
      }

      const contactPayload = {
        full_name: fullName,
        email: email,
        phone: cleanedPhone,
        company_name: companyName || null,
        location: location || null,
        subject: subject || null,
        message: message,
        preferred_contact: 'whatsapp',
        page_url: pageUrl || null,
        status: 'new',
        notification_sent: false
      };

      const { error } = await supabase
        .from('contact_enquiries')
        .insert([contactPayload]);

      if (error) {
        console.error('[Contact API Error]: Supabase insert to contact_enquiries failed:', error.message || error);
        return res.status(500).json({
          success: false,
          error: 'We could not save your enquiry. Please try again.'
        });
      }
    } else if (formType === 'quote') {
      // Quote Form Specific Validations
      if (!service) {
        return res.status(400).json({ success: false, error: 'Please select at least one expected service.' });
      }
      if (!budget) {
        return res.status(400).json({ success: false, error: 'Please enter your estimated budget.' });
      }
      if (!timeline) {
        return res.status(400).json({ success: false, error: 'Please select estimated timeframe / days.' });
      }

      const quotePayload = {
        full_name: fullName,
        email: email,
        phone: cleanedPhone,
        location: location || null,
        service: service,
        budget: budget,
        timeline: timeline,
        message: message || null,
        preferred_contact: 'whatsapp',
        page_url: pageUrl || null,
        status: 'new',
        notification_sent: false
      };

      const { error } = await supabase
        .from('quote_enquiries')
        .insert([quotePayload]);

      if (error) {
        console.error('[Quote API Error]: Supabase insert to quote_enquiries failed:', error.message || error);
        return res.status(500).json({
          success: false,
          error: 'We could not save your enquiry. Please try again.'
        });
      }
    }

    // 7. Confirmed Success Response
    return res.status(200).json({
      success: true,
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
