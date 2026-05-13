#!/usr/bin/env python3
"""
Community Web Scraper
Extracts community/project information from websites using Python's standard library
"""

import sys
import json
import re
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
from html.parser import HTMLParser
from typing import Dict, List, Optional

class CommunityHTMLParser(HTMLParser):
    """Parse HTML and extract community-related information"""

    def __init__(self):
        super().__init__()
        self.meta_tags = {}
        self.social_links = {
            'twitter': None,
            'discord': None,
            'telegram': None,
            'github': None,
            'website': None
        }
        self.title = None
        self.in_title = False
        self.text_content = []
        self.current_tag = None

    def handle_starttag(self, tag, attrs):
        self.current_tag = tag
        attrs_dict = dict(attrs)

        # Extract meta tags
        if tag == 'meta':
            property_val = attrs_dict.get('property', '')
            name_val = attrs_dict.get('name', '')
            content = attrs_dict.get('content', '')

            if property_val == 'og:title' or name_val == 'og:title':
                self.meta_tags['og_title'] = content
            elif property_val == 'og:description' or name_val == 'og:description':
                self.meta_tags['og_description'] = content
            elif property_val == 'og:image' or name_val == 'og:image':
                self.meta_tags['og_image'] = content
            elif name_val == 'twitter:image':
                self.meta_tags['twitter_image'] = content
            elif name_val == 'twitter:title':
                self.meta_tags['twitter_title'] = content
            elif name_val == 'twitter:description':
                self.meta_tags['twitter_description'] = content
            elif name_val == 'description':
                self.meta_tags['description'] = content

        # Extract social links
        elif tag == 'a':
            href = attrs_dict.get('href', '')
            if href:
                self._extract_social_link(href)

        # Track title tag
        elif tag == 'title':
            self.in_title = True

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False
        self.current_tag = None

    def handle_data(self, data):
        if self.in_title:
            self.title = data.strip()
        # Collect text content for description extraction
        if self.current_tag in ['p', 'div', 'span', 'h1', 'h2', 'h3']:
            text = data.strip()
            if len(text) > 20:  # Only meaningful text
                self.text_content.append(text)

    def _extract_social_link(self, href: str):
        """Extract social media links from href"""
        # Twitter/X
        if 'twitter.com' in href or 'x.com' in href:
            if not self.social_links['twitter']:
                self.social_links['twitter'] = href
        # Discord
        elif 'discord.gg' in href or 'discord.com/invite' in href:
            if not self.social_links['discord']:
                self.social_links['discord'] = href
        # Telegram
        elif 't.me' in href:
            if not self.social_links['telegram']:
                self.social_links['telegram'] = href
        # GitHub
        elif 'github.com' in href:
            if not self.social_links['github']:
                self.social_links['github'] = href

def make_absolute_url(url: str, base_url: str) -> str:
    """Convert relative URLs to absolute URLs"""
    if not url:
        return url
    if url.startswith('http://') or url.startswith('https://'):
        return url
    if url.startswith('//'):
        return 'https:' + url
    if url.startswith('/'):
        from urllib.parse import urlparse
        parsed = urlparse(base_url)
        return f"{parsed.scheme}://{parsed.netloc}{url}"
    return url

def extract_community_data(url: str) -> Dict:
    """
    Scrape a community website and extract structured data

    Args:
        url: The URL to scrape

    Returns:
        Dictionary with extracted community data
    """
    try:
        # Set up request with user agent
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        request = Request(url, headers=headers)

        # Fetch the webpage
        with urlopen(request, timeout=15) as response:
            html_content = response.read().decode('utf-8', errors='ignore')

        # Parse HTML
        parser = CommunityHTMLParser()
        parser.feed(html_content)

        # Extract name (priority: og:title, twitter:title, title tag, domain)
        name = (
            parser.meta_tags.get('og_title') or
            parser.meta_tags.get('twitter_title') or
            parser.title or
            url.split('/')[2]  # domain name as fallback
        )

        # Extract description
        description = (
            parser.meta_tags.get('og_description') or
            parser.meta_tags.get('twitter_description') or
            parser.meta_tags.get('description') or
            ' '.join(parser.text_content[:3]) if parser.text_content else ''
        )

        # Limit description length
        if len(description) > 500:
            description = description[:497] + '...'

        # Extract logo/image
        logo = parser.meta_tags.get('og_image') or parser.meta_tags.get('twitter_image') or ''
        if logo:
            logo = make_absolute_url(logo, url)

        # Generate slug from name
        slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')

        # Determine category based on keywords in content
        content_lower = (name + ' ' + description).lower()
        category = 'Other'
        if any(word in content_lower for word in ['defi', 'finance', 'swap', 'dex', 'lending']):
            category = 'DeFi'
        elif any(word in content_lower for word in ['nft', 'collectible', 'art']):
            category = 'NFT'
        elif any(word in content_lower for word in ['game', 'gaming', 'play']):
            category = 'Gaming'
        elif any(word in content_lower for word in ['dao', 'governance', 'voting']):
            category = 'DAO'
        elif any(word in content_lower for word in ['infrastructure', 'protocol', 'network']):
            category = 'Infrastructure'

        # Extract tags from description
        tags = []
        common_tags = ['ethereum', 'blockchain', 'web3', 'crypto', 'bitcoin', 'defi', 'nft', 'dao', 'metaverse']
        for tag in common_tags:
            if tag in content_lower:
                tags.append(tag.capitalize())
        tags = tags[:5]  # Limit to 5 tags

        # Build result
        result = {
            'success': True,
            'data': {
                'name': name[:100],  # Limit name length
                'slug': slug[:100],
                'tagline': description[:200] if description else '',
                'description': description,
                'logo': logo,
                'coverImage': logo,  # Use same image for cover
                'website': url,
                'twitter': parser.social_links['twitter'] or '',
                'discord': parser.social_links['discord'] or '',
                'telegram': parser.social_links['telegram'] or '',
                'github': parser.social_links['github'] or '',
                'category': category,
                'tags': tags,
                'memberCount': None,
                'founded': '',
                'about': description,
                'mission': '',
                'vision': '',
                'values': [],
                'features': []
            }
        }

        return result

    except HTTPError as e:
        return {
            'success': False,
            'error': f'HTTP Error {e.code}: {e.reason}'
        }
    except URLError as e:
        return {
            'success': False,
            'error': f'URL Error: {str(e.reason)}'
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Scraping error: {str(e)}'
        }

def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'Usage: python3 community_scraper.py <url>'
        }))
        sys.exit(1)

    url = sys.argv[1]
    result = extract_community_data(url)
    print(json.dumps(result, indent=2))

if __name__ == '__main__':
    main()
