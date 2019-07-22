const cheerio = require('cheerio');
const axios = require('axios');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const urls = [
	'http://www.thebluebook.com/search.html?class=160&region=31&searchsrc=index&searchTerm=Anchors--Masonry+%26+Concrete&regionLabel=Summitville%2C+IN&geographicarea=Indiana+-+Indianapolis%2C+Fort+Wayne+%26+Vicinity',
	// 'http://www.thebluebook.com/search.html?class=370&region=31&searchsrc=index&searchTerm=Brick--Face+%26+Common&regionLabel=Summitville%2C+IN&geographicarea=Indiana+-+Indianapolis%2C+Fort+Wayne+%26+Vicinity',
	// 'http://www.thebluebook.com/search.html?class=0370&region=31&searchsrc=index&geographicarea=Indiana+-+Indianapolis%2C+Fort+Wayne+%26+Vicinity&searchTerm=Brick--Face+%26+Common&page=2',
	// 'http://www.thebluebook.com/search.html?class=395&region=31&searchsrc=index&searchTerm=Brickfacing+%26+Stonefacing&regionLabel=Summitville%2C+IN&geographicarea=Indiana+-+Indianapolis%2C+Fort+Wayne+%26+Vicinity',
	// 'http://www.thebluebook.com/search.html?class=4110&region=31&searchsrc=index&searchTerm=Cast+Stone&regionLabel=Summitville%2C+IN&geographicarea=Indiana+-+Indianapolis%2C+Fort+Wayne+%26+Vicinity',
	// 'http://www.thebluebook.com/search.html?class=2220&region=31&searchsrc=index&searchTerm=Glass+Block&regionLabel=Summitville%2C+IN&geographicarea=Indiana+-+Indianapolis%2C+Fort+Wayne+%26+Vicinity',
	// 'http://www.thebluebook.com/search.html?class=2290&region=31&searchsrc=index&searchTerm=Grout--Pre-Mixed+%26+Pressure&regionLabel=Summitville%2C+IN&geographicarea=Indiana+-+Indianapolis%2C+Fort+Wayne+%26+Vicinity',
	// 'http://www.thebluebook.com/search.html?class=2830&region=31&searchsrc=index&searchTerm=Marble+%26+Granite&regionLabel=Summitville%2C+IN&geographicarea=Indiana+-+Indianapolis%2C+Fort+Wayne+%26+Vicinity',
	// 'http://www.thebluebook.com/search.html?class=2832&region=31&searchsrc=index&searchTerm=Marble+Refinishing&regionLabel=Summitville%2C+IN&geographicarea=Indiana+-+Indianapolis%2C+Fort+Wayne+%26+Vicinity',
	// 'http://www.thebluebook.com/search.html?class=1730&region=31&searchsrc=index&searchTerm=Employment+Agencies&regionLabel=Summitville%2C+IN&geographicarea=Indiana+-+Indianapolis%2C+Fort+Wayne+%26+Vicinity',
	// 'http://www.thebluebook.com/search.html?class=390&region=31&searchsrc=index&searchTerm=Mason+Contractors&regionLabel=Summitville%2C+IN&geographicarea=Indiana+-+Indianapolis%2C+Fort+Wayne+%26+Vicinity',
	// 'http://www.thebluebook.com/search.html?class=0370&region=31&searchsrc=index&geographicarea=Indiana+-+Indianapolis%2C+Fort+Wayne+%26+Vicinity&searchTerm=Brick--Face+%26+Common&page=2',
	// 'http://www.thebluebook.com/search.html?class=0395&region=31&searchsrc=index&geographicarea=Indiana+-+Indianapolis%2C+Fort+Wayne+%26+Vicinity&searchTerm=Brickfacing+%26+Stonefacing&page=2'
];

const puppeteer = require('puppeteer');
const chromeOptions = {
	headless: false,
  defaultViewport: null,
  slowMo:10
};
(async function main() {
	let contractorNumberMap = [];

	for (let url of urls) {
    const browser = await puppeteer.launch(chromeOptions);
		const page = await browser.newPage();
		await page.goto(url);

		let document = await page.content();
		const $ = cheerio.load(document);

		let phoneNumbers = $("span[itemprop = 'telephone']")
			.toArray()
			.map(function(x) {
				return $(x).text();
			});
		let contractors = $("[itemprop = 'name']")
			.toArray()
			.map(x => {
				return $(x).text();
			});
		contractors.forEach(c => {
			contractorNumberMap = [
				...contractorNumberMap,
				{
					name: c,
					telephone: phoneNumbers[contractors.indexOf(c)]
				}
			];
    });
	}
	return contractorNumberMap;
})()
	.then(res => {
		const csvWriter = createCsvWriter({
			path: 'out.csv',
			header: [{ id: 'name', title: 'Name' }, { id: 'telephone', title: 'Telephone' }]
		});
		csvWriter.writeRecords(res);
	})
	.catch(e => console.log(e));
