const express = require('express');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage for domain checks (simulating database)
let domainChecks = [];
let nextId = 1;

/**
 * Fetch SSL certificate information for a domain
 * @param {string} domain - The domain to check
 * @param {number} port - The port to check (default: 443)
 * @returns {Promise<Object>} SSL certificate information
 */
function getSSLCertificate(domain, port = 443) {
  return new Promise((resolve, reject) => {
    // Note: rejectUnauthorized is set to false to allow checking certificates
    // even if they are expired, self-signed, or have validation issues.
    // This is intentional as the purpose is to retrieve certificate information,
    // not to validate its trustworthiness.
    const options = {
      host: domain,
      port: port,
      method: 'GET',
      rejectUnauthorized: false,
      agent: false
    };

    const req = https.request(options, (res) => {
      const certificate = res.socket.getPeerCertificate();
      
      if (!certificate || Object.keys(certificate).length === 0) {
        req.destroy();
        reject(new Error('No certificate found'));
        return;
      }

      // Extract issuer organization
      let issuer = 'Unknown';
      if (certificate.issuer && certificate.issuer.O) {
        issuer = certificate.issuer.O;
      }

      // Extract common name
      let certCN = domain;
      if (certificate.subject && certificate.subject.CN) {
        certCN = certificate.subject.CN;
      }

      // Format expiry date (remove milliseconds and Z)
      let expiryDate = null;
      let daysLeft = null;
      if (certificate.valid_to) {
        const date = new Date(certificate.valid_to);
        expiryDate = date.toISOString().slice(0, -5);
        
        // Calculate days left until expiry
        const now = new Date();
        const timeDiff = date.getTime() - now.getTime();
        daysLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      }

      // Destroy the request after getting certificate info
      req.destroy();
      
      resolve({
        certCN: certCN,
        issuer: issuer,
        expiryDate: expiryDate,
        daysLeft: daysLeft,
        valid_from: certificate.valid_from,
        valid_to: certificate.valid_to
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

/**
 * API endpoint to check SSL certificate for a domain
 * GET /api/Domains/:domain
 */
app.get('/api/Domains/:domain', async (req, res) => {
  const domain = req.params.domain;
  const portParam = req.query.port;
  
  // Validate port parameter
  let port = 443;
  if (portParam) {
    port = parseInt(portParam, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      return res.status(400).json({
        error: 'Invalid port number',
        message: 'Port must be a number between 1 and 65535',
        providedPort: portParam
      });
    }
  }

  try {
    // Fetch SSL certificate information
    const certInfo = await getSSLCertificate(domain, port);

    // Create the response object (format timestamp without milliseconds)
    const lastChecked = new Date().toISOString().slice(0, -5);
    
    const domainCheck = {
      domainName: domain,
      port: port,
      certCN: certInfo.certCN,
      issuer: certInfo.issuer,
      expiryDate: certInfo.expiryDate,
      daysLeft: certInfo.daysLeft,
      lastChecked: lastChecked,
      userId: "User",
      agent: 0,
      silenced: false,
      publicPrefix: true,
      id: nextId++
    };

    // Store in memory (simulating database save)
    domainChecks.push(domainCheck);

    // Return as array (matching the example format)
    res.json([domainCheck]);
  } catch (error) {
    console.error(`Error checking SSL for ${domain}:`, error.message);
    res.status(500).json({
      error: 'Failed to retrieve SSL certificate',
      message: error.message,
      domain: domain
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.json({
    message: 'SSL Checker API',
    version: '1.0.0',
    endpoints: {
      sslCheck: '/api/Domains/:domain',
      health: '/health'
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`SSL Checker API running on port ${PORT}`);
  console.log(`Example: http://localhost:${PORT}/api/Domains/pingsut.com`);
});
