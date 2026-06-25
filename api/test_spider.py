import scrapy
class TestSpider(scrapy.Spider):
    name = 'test'
    start_urls = ['http://example.com/']
    def start_requests(self):
        yield scrapy.Request('http://example.org/')
