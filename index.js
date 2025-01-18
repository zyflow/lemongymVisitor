require("dotenv").config();
const { google } = require("googleapis");
const fs = require("fs");
const fetcher = require("./fetchData")

const credentials = JSON.parse(fs.readFileSync("credentials.json", "utf-8"));

async function saveToGoogleSheet() {
    const resultPercentage = await fetcher();
    const { client_email, private_key } = credentials;

    // Authenticate with Google API
    const auth = new google.auth.JWT(
        client_email,
        null,
        private_key,
        ["https://www.googleapis.com/auth/spreadsheets"]
    );

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = process.env.SPREADSHEET_ID; // Replace with your Google Sheet ID
    const range = process.env.SHEET_NAME; // Replace with your target sheet and cell range

    console.log('spreadsheetid ', process.env.SPREADSHEET_ID, 'range', process.env.SHEET_NAME)
    try {
        const now = new Date();
        const formattedData = [
          resultPercentage,
          now.toLocaleTimeString("lv-LV", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Riga" }),
          now.toISOString().split('T')[0], // YYYY-MM-DD format
        ];

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: "RAW",
            resource: {
                values: [formattedData]
            }
        });
    } catch (error) {
        console.error("Error saving data to Google Sheets:", error);
    }
}

const axios = require('axios');
const cheerio = require('cheerio');

async function fetchData() {
  try {
    // Step 1: Send HTTP GET request
    const response = await axios.get(
      'https://www.lemongym.lv/wp-json/api/async-render-block?pid=MTI2NQ==&bid=YWNmL2NsdWJzLW9jY3VwYW5jeQ==&rest_language=lv',
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const result = response.data.data.content; // Extract the content field

    // Step 2: Parse the HTML and find Akropole
    const $ = cheerio.load(result);
    let percentage = 0;

    $('.clubs-occupancy').each((i, element) => {
      const address = $(element).find('p.mb-0').text();
      const name = $(element).find('h6.xs-small').text();
      const perc = $(element)
        .find('.clubs-occupancy__percentage')
        .text()
        .trim();

      if (address.includes('Latgales') && name.includes('Akropole')) {
        percentage = parseInt(perc.replace('%', ''), 10);
      }
    });

    return percentage;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

saveToGoogleSheet();
