const { createClient } = require('@supabase/supabase-js');

// Simple In-Memory Cache for Rate Limiting & Duplicate Prevention
const rateLimitMap = new Map();
const duplicateMap = new Map();

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

    // 2. Extract & Sanitize All Input Fields
    const formType = sanitizeInput(body.form_type);
    const fullName = sanitizeInput(body.full_name || body.name);
    const email = sanitizeInput(body.email);
    const rawPhone = sanitizeInput(body.phone);
    const location = sanitizeInput(body.location);
    const companyName = sanitizeInput(body.company_name || body.business);
    const subject = sanitizeInput(body.subject);
    const service = sanitizeInput(body.service);
    const budget = sanitizeInput(body.budget);
    const timeline = sanitizeInput(body.timeline || body.estimated_days);
    const message = sanitizeInput(body.message || body.comments);
    const pageUrl = sanitizeInput(body.page_url);

    // 3. Rate Limiting Protection (Max 5 submissions per 10 minutes per IP/Email)
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const rateKey = `${clientIp}:${email}`;
    const now = Date.now();
    const rateWindow = 10 * 60 * 1000; // 10 minutes

    const userRate = rateLimitMap.get(rateKey) || { count: 0, resetTime: now + rateWindow };
    if (now > userRate.resetTime) {
      userRate.count = 0;
      userRate.resetTime = now + rateWindow;
    }
    userRate.count += 1;
    rateLimitMap.set(rateKey, userRate);

    if (userRate.count > 5) {
      return res.status(429).json({
        success: false,
        error: 'Too many enquiry requests. Please try again after 10 minutes.'
      });
    }

    // 4. Duplicate Submission Prevention (Block exact identical submissions within 60 seconds)
    const dupKey = `${email}:${formType}:${message.substring(0, 50)}`;
    const lastSub = duplicateMap.get(dupKey);
    if (lastSub && (now - lastSub < 60000)) {
      return res.status(429).json({
        success: false,
        error: 'Duplicate enquiry detected. Your submission has already been received.'
      });
    }
    duplicateMap.set(dupKey, now);

    // 5. Server-Side Common Field Validations
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

    if (location && location.length > 150) {
      return res.status(400).json({ success: false, error: 'Location exceeds 150 characters limit.' });
    }

    // 6. Strict Environment Variables Check (Strictly SUPABASE_URL and SUPABASE_SECRET_KEY)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
      console.error('[Enquiry API Error]: Production environment variables SUPABASE_URL or SUPABASE_SECRET_KEY missing.');
      return res.status(500).json({
        success: false,
        error: 'We could not save your enquiry. Please try again.'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseSecretKey);

    // 7. Secure Table Mapping & Strict Payload Construction
    let tableName;
    let payload;

    if (formType === 'contact') {
      tableName = 'contact_enquiries';

      if (!message) {
        return res.status(400).json({ success: false, error: 'Please describe your project requirements.' });
      }
      if (message.length > 3000) {
        return res.status(400).json({ success: false, error: 'Message content exceeds 3000 characters limit.' });
      }
      if (companyName && companyName.length > 150) {
        return res.status(400).json({ success: false, error: 'Company name exceeds 150 characters limit.' });
      }
      if (subject && subject.length > 200) {
        return res.status(400).json({ success: false, error: 'Subject line exceeds 200 characters limit.' });
      }

      payload = {
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

    } else if (formType === 'quote') {
      tableName = 'quote_enquiries';

      if (!service) {
        return res.status(400).json({ success: false, error: 'Please select at least one expected service.' });
      }
      if (service.length > 1000) {
        return res.status(400).json({ success: false, error: 'Service selection text exceeds length limit.' });
      }

      if (!budget) {
        return res.status(400).json({ success: false, error: 'Please enter your estimated budget.' });
      }
      if (budget.length > 100) {
        return res.status(400).json({ success: false, error: 'Budget field exceeds length limit.' });
      }

      if (!timeline) {
        return res.status(400).json({ success: false, error: 'Please select estimated timeframe / days.' });
      }
      if (timeline.length > 100) {
        return res.status(400).json({ success: false, error: 'Timeline field exceeds length limit.' });
      }

      if (message && message.length > 3000) {
        return res.status(400).json({ success: false, error: 'Message content exceeds 3000 characters limit.' });
      }

      payload = {
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

    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid form type.'
      });
    }

    // 8. Execute Supabase Insert
    const { data, error } = await supabase
      .from(tableName)
      .insert([payload])
      .select('id')
      .single();

    if (error) {
      console.error('[Supabase Insert Error]:', {
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

    // 9. Confirmed Success Response
    return res.status(201).json({
      success: true,
      enquiryId: data ? data.id : null,
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
