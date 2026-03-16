const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const BLOG_DIR = path.join(__dirname, 'posts');
const POSTS_OUTPUT_DIR = path.join(__dirname, 'posts');
const BLOG_INDEX_PATH = path.join(__dirname, 'index.html');
const ROOT_INDEX_PATH = path.join(__dirname, '..', 'index.html');

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getAllPosts() {
  const files = fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.md'))
    .filter(f => fs.statSync(path.join(BLOG_DIR, f)).isFile());
  
  const posts = files.map(file => {
    const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
    const parsed = matter(content);
    
    if (!parsed.data.title) {
      console.error(`Error: Missing title in ${file}`);
      return null;
    }
    
    const slug = slugify(parsed.data.title);
    return {
      ...parsed.data,
      content: parsed.content,
      html: marked(parsed.content),
      slug,
      filename: file
    };
  }).filter(post => post !== null);
  
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function generatePostHTML(post) {
  const tagsHtml = post.tags ? post.tags.map(tag => 
    `<span class="px-3 py-1 rounded-full bg-white/5 text-white/60 text-sm border border-white/10">${tag}</span>`
  ).join('') : '';

  const ogImage = post.featured_image || '/images/gsylabs.webp';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${post.excerpt}">
    <meta name="theme-color" content="#0a0a0a">
    <meta property="og:title" content="${post.title} | GSY Labs Blog">
    <meta property="og:description" content="${post.excerpt}">
    <meta property="og:image" content="https://gsylabs.gg${ogImage}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://gsylabs.gg/blog/posts/${post.slug}/">
    <meta property="article:published_time" content="${post.date}">
    <meta property="article:author" content="${post.author}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${post.title}">
    <meta name="twitter:description" content="${post.excerpt}">
    <meta name="twitter:image" content="https://gsylabs.gg${ogImage}">
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "${post.title}",
        "description": "${post.excerpt}",
        "image": "https://gsylabs.gg${ogImage}",
        "datePublished": "${post.date}",
        "author": {
            "@type": "Organization",
            "name": "GSY Labs"
        },
        "publisher": {
            "@type": "Organization",
            "name": "GSY Labs",
            "logo": {
                "@type": "ImageObject",
                "url": "https://gsylabs.gg/images/gsylabs.webp"
            }
        }
    }
    </script>
    <title>${post.title} | GSY Labs Blog</title>
    <link rel="icon" type="image/png" href="/images/gsylabs.webp">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Space Grotesk', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
                    }
                }
            }
        }
    </script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: #0a0a0a;
            font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
            overflow-x: hidden;
            color: #fff;
        }
        .glass-card {
            background: rgba(20, 20, 20, 0.9);
            border: 1px solid rgba(255,255,255,0.08);
            backdrop-filter: blur(16px);
            box-shadow: 0 8px 48px rgba(0,0,0,0.6);
        }
        .section-divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        }
        .btn-primary {
            background: rgba(255,255,255,0.08);
            border: 1.5px solid rgba(255,255,255,0.25);
            transition: all 0.3s ease;
            color: #fff;
            box-shadow: 0 0 0 0 rgba(255,255,255,0);
        }
        .btn-primary:hover {
            background: rgba(255,255,255,0.18);
            border-color: rgba(255,255,255,0.5);
            box-shadow: 0 0 20px rgba(255,255,255,0.25);
        }
        .article-content h1 { font-size: 2rem; font-weight: 700; margin-bottom: 1.5rem; line-height: 1.2; }
        .article-content h2 { font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: rgba(255,255,255,0.9); }
        .article-content h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; color: rgba(255,255,255,0.85); }
        .article-content p { margin-bottom: 1.25rem; line-height: 1.8; color: rgba(255,255,255,0.7); }
        .article-content ul { margin-bottom: 1.25rem; padding-left: 1.5rem; list-style-type: disc; }
        .article-content ol { margin-bottom: 1.25rem; padding-left: 1.5rem; list-style-type: decimal; }
        .article-content li { margin-bottom: 0.5rem; color: rgba(255,255,255,0.7); }
        .article-content a { color: rgba(255,255,255,0.9); text-decoration: underline; text-underline-offset: 3px; }
        .article-content a:hover { color: #fff; }
        .article-content blockquote {
            border-left: 3px solid rgba(255,255,255,0.2);
            padding-left: 1rem;
            margin: 1.5rem 0;
            font-style: italic;
            color: rgba(255,255,255,0.6);
        }
        .article-content code {
            background: rgba(255,255,255,0.1);
            padding: 0.2rem 0.4rem;
            border-radius: 0.25rem;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 0.9em;
        }
        .article-content pre {
            background: rgba(255,255,255,0.05);
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            margin: 1.5rem 0;
        }
        .article-content pre code {
            background: none;
            padding: 0;
        }
        .share-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            transition: all 0.2s ease;
        }
        .share-linkedin {
            background: #0077b5;
            color: white;
        }
        .share-linkedin:hover {
            background: #006396;
        }
        .share-x {
            background: #000;
            color: white;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .share-x:hover {
            background: rgba(255,255,255,0.1);
        }
    </style>
</head>
<body>
    <a href="/" class="fixed top-4 right-4 sm:top-6 sm:right-6 z-50" aria-label="GSY Labs home">
        <img src="/images/gsylabs.webp" alt="GSY Labs" class="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full shadow-lg hover:scale-105 transition-transform">
    </a>

    <main class="min-h-screen bg-[#0a0a0a]">
        <section class="py-16 sm:py-24 px-4 sm:px-6">
            <div class="max-w-3xl mx-auto">
                <nav class="mb-8">
                    <a href="/blog/" class="text-white/50 hover:text-white transition-colors inline-flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                        Back to Blog
                    </a>
                </nav>

                <article class="glass-card rounded-2xl p-6 sm:p-8 md:p-12">
                    <header class="mb-8 pb-8 border-b border-white/10">
                        ${post.featured_image ? `<img src="${post.featured_image}" alt="${post.title}" class="w-full h-48 sm:h-64 object-cover rounded-xl mb-6">` : ''}
                        <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight">${post.title}</h1>
                        ${post.excerpt ? `<p class="text-lg text-white/60 mb-4 leading-relaxed italic">${post.excerpt}</p>` : ''}
                        <div class="flex flex-wrap items-center gap-4 text-sm text-white/50 mb-4">
                            <span class="flex items-center gap-1">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                ${formatDate(post.date)}
                            </span>
                            <span class="flex items-center gap-1">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                ${post.author}
                            </span>
                        </div>
                        ${tagsHtml ? `<div class="flex flex-wrap gap-2">${tagsHtml}</div>` : ''}
                    </header>

                    <div class="article-content mb-8">
                        ${post.html}
                    </div>

                    <footer class="pt-8 border-t border-white/10">
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <p class="text-sm text-white/50 mb-3">Share this post</p>
                                <div class="flex gap-2">
                                    <a href="https://www.linkedin.com/sharing/share-offsite/?url=https://gsylabs.gg/blog/posts/${post.slug}/&title=${encodeURIComponent(post.title)}&summary=${encodeURIComponent(post.excerpt)}" 
                                       target="_blank" rel="noopener" 
                                       class="share-btn share-linkedin"
                                       aria-label="Share on LinkedIn">
                                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                        LinkedIn
                                    </a>
                                    <a href="https://twitter.com/intent/tweet?url=https://gsylabs.gg/blog/posts/${post.slug}/&text=${encodeURIComponent(post.title)}" 
                                       target="_blank" rel="noopener" 
                                       class="share-btn share-x"
                                       aria-label="Share on X">
                                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                        X
                                    </a>
                                </div>
                            </div>
                            <a href="/blog/" class="btn-primary px-6 py-2 rounded-full text-sm">
                                View All Posts
                            </a>
                        </div>
                    </footer>
                </article>
            </div>
        </section>

        <div class="section-divider max-w-4xl mx-auto"></div>

        <footer class="py-12 sm:py-16 px-4 sm:px-6">
            <div class="max-w-4xl mx-auto text-center">
                <img src="/images/gsylabs.webp" alt="GSY Labs" class="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-full opacity-80">
                <p class="text-white/50 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
                    Building modern infrastructure tools for Guernsey.
                </p>
                <div class="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 mb-8 sm:mb-12">
                    <a href="mailto:contact@gsylabs.gg" class="flex items-center justify-center gap-2 text-white/60 hover:text-white transition-colors text-sm sm:text-base">
                        <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>
                        <span class="hidden sm:inline">contact@gsylabs.gg</span>
                        <span class="sm:hidden">Email</span>
                    </a>
                    <a href="https://www.linkedin.com/company/gyslabs" target="_blank" rel="noopener" class="flex items-center justify-center gap-2 text-white/60 hover:text-white transition-colors text-sm sm:text-base">
                        <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        <span class="hidden sm:inline">LinkedIn</span>
                        <span class="sm:hidden">LinkedIn</span>
                    </a>
                </div>
                <div class="text-white/25 text-xs sm:text-sm">© 2026 GSY Labs. All rights reserved.</div>
            </div>
        </footer>
    </main>
</body>
</html>`;
}

function generateBlogIndexHTML(posts) {
  const postsHtml = posts.map(post => {
    const tagsHtml = post.tags ? post.tags.map(tag => 
      `<span class="px-2 py-1 rounded-full bg-white/5 text-white/50 text-xs border border-white/10">${tag}</span>`
    ).join('') : '';

    return `
            <article class="glass-card rounded-2xl overflow-hidden hover:transform hover:-translate-y-1 transition-all duration-300">
                <a href="/blog/posts/${post.slug}/" class="block">
                    ${post.featured_image ? `<div class="h-48 overflow-hidden"><img src="${post.featured_image}" alt="${post.title}" class="w-full h-full object-cover"></div>` : '<div class="h-32 bg-white/5 flex items-center justify-center text-4xl">📝</div>'}
                    <div class="p-6">
                        <div class="flex flex-wrap items-center gap-2 text-xs text-white/40 mb-3">
                            <span>${formatDate(post.date)}</span>
                            <span>•</span>
                            <span>${post.author}</span>
                        </div>
                        <h3 class="text-xl font-semibold mb-3 line-clamp-2">${post.title}</h3>
                        <p class="text-white/50 text-sm mb-4 line-clamp-2">${post.excerpt}</p>
                        ${tagsHtml ? `<div class="flex flex-wrap gap-1">${tagsHtml}</div>` : ''}
                    </div>
                </a>
            </article>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Read the latest from GSY Labs about building modern infrastructure tools for Guernsey.">
    <meta name="theme-color" content="#0a0a0a">
    <meta property="og:title" content="GSY Labs Blog">
    <meta property="og:description" content="Insights about building modern infrastructure tools for Guernsey.">
    <meta property="og:image" content="https://gsylabs.gg/images/gsylabs.webp">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://gsylabs.gg/blog/">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="GSY Labs Blog">
    <meta name="twitter:description" content="Insights about building modern infrastructure tools for Guernsey.">
    <meta name="twitter:image" content="https://gsylabs.gg/images/gsylabs.webp">
    <title>Blog | GSY Labs</title>
    <link rel="icon" type="image/png" href="/images/gsylabs.webp">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Space Grotesk', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
                    }
                }
            }
        }
    </script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: #0a0a0a;
            font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
            overflow-x: hidden;
            color: #fff;
        }
        .glass-card {
            background: rgba(20, 20, 20, 0.9);
            border: 1px solid rgba(255,255,255,0.08);
            backdrop-filter: blur(16px);
            box-shadow: 0 8px 48px rgba(0,0,0,0.6);
        }
        .section-divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        }
        .btn-primary {
            background: rgba(255,255,255,0.08);
            border: 1.5px solid rgba(255,255,255,0.25);
            transition: all 0.3s ease;
            color: #fff;
            box-shadow: 0 0 0 0 rgba(255,255,255,0);
        }
        .btn-primary:hover {
            background: rgba(255,255,255,0.18);
            border-color: rgba(255,255,255,0.5);
            box-shadow: 0 0 20px rgba(255,255,255,0.25);
        }
    </style>
</head>
<body>
    <a href="/" class="fixed top-4 right-4 sm:top-6 sm:right-6 z-50" aria-label="GSY Labs home">
        <img src="/images/gsylabs.webp" alt="GSY Labs" class="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full shadow-lg hover:scale-105 transition-transform">
    </a>

    <main class="min-h-screen bg-[#0a0a0a]">
        <section class="py-16 sm:py-24 px-4 sm:px-6">
            <div class="max-w-6xl mx-auto">
                <nav class="mb-8">
                    <a href="/" class="text-white/50 hover:text-white transition-colors inline-flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                        Back to Home
                    </a>
                </nav>

                <div class="text-center mb-12 sm:mb-16">
                    <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Blog</h1>
                    <p class="text-white/50 text-base sm:text-lg max-w-2xl mx-auto">
                        Insights about building modern infrastructure tools for Guernsey.
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    ${postsHtml}
                </div>
            </div>
        </section>

        <div class="section-divider max-w-4xl mx-auto"></div>

        <footer class="py-12 sm:py-16 px-4 sm:px-6">
            <div class="max-w-4xl mx-auto text-center">
                <img src="/images/gsylabs.webp" alt="GSY Labs" class="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-full opacity-80">
                <p class="text-white/50 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
                    Building modern infrastructure tools for Guernsey.
                </p>
                <div class="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 mb-8 sm:mb-12">
                    <a href="mailto:contact@gsylabs.gg" class="flex items-center justify-center gap-2 text-white/60 hover:text-white transition-colors text-sm sm:text-base">
                        <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>
                        <span class="hidden sm:inline">contact@gsylabs.gg</span>
                        <span class="sm:hidden">Email</span>
                    </a>
                    <a href="https://www.linkedin.com/company/gyslabs" target="_blank" rel="noopener" class="flex items-center justify-center gap-2 text-white/60 hover:text-white transition-colors text-sm sm:text-base">
                        <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        <span class="hidden sm:inline">LinkedIn</span>
                        <span class="sm:hidden">LinkedIn</span>
                    </a>
                </div>
                <div class="text-white/25 text-xs sm:text-sm">© 2026 GSY Labs. All rights reserved.</div>
            </div>
        </footer>
    </main>
</body>
</html>`;
}

function updateHomepageLatestPosts(posts) {
  const latestPosts = posts.slice(0, 3);
  
  const latestPostsHtml = latestPosts.map(post => {
    return `
                <a href="/blog/posts/${post.slug}/" class="block">
                    <article class="glass-card rounded-xl p-5 sm:p-6 hover:bg-white/5 transition-colors cursor-pointer">
                        <div class="flex flex-wrap items-center gap-2 text-xs text-white/40 mb-2">
                            <span>${formatDate(post.date)}</span>
                            <span>•</span>
                            <span>${post.author}</span>
                        </div>
                        <h3 class="text-lg font-semibold mb-2 line-clamp-2">${post.title}</h3>
                        <p class="text-white/50 text-sm mb-3 line-clamp-2">${post.excerpt}</p>
                        <span class="text-sm text-white/70 inline-flex items-center gap-1">
                            Read more
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                        </span>
                    </article>
                </a>`;
  }).join('\n');

  const sectionHtml = `
        <section id="blog" class="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
            <div class="max-w-4xl mx-auto">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-12">
                    <div>
                        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Latest Posts</h2>
                        <p class="text-white/50 text-sm sm:text-base">Updates and insights from the team</p>
                    </div>
                    <a href="/blog/" class="btn-primary px-5 py-2 rounded-full text-sm inline-flex items-center gap-2">
                        View all posts
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </a>
                </div>
                <div class="space-y-4">
${latestPostsHtml}
                </div>
            </div>
        </section>
`;

  let indexContent = fs.readFileSync(ROOT_INDEX_PATH, 'utf-8');
  
  const blogSectionRegex = /<div class="section-divider max-w-4xl mx-auto"><\/div>\s*<section id="blog"[\s\S]*?<\/section>/;
  const aboutSectionMatch = indexContent.match(/<section id="about"/);
  
  if (blogSectionRegex.test(indexContent)) {
    indexContent = indexContent.replace(blogSectionRegex, sectionHtml.trim());
  } else if (aboutSectionMatch) {
    indexContent = indexContent.slice(0, aboutSectionMatch.index) + sectionHtml + '\n        ' + indexContent.slice(aboutSectionMatch.index);
  }
  
  fs.writeFileSync(ROOT_INDEX_PATH, indexContent);
  console.log('✓ Updated homepage with latest posts');
}

function generatePostsJSON(posts) {
  const postsData = posts.map(post => ({
    title: post.title,
    date: post.date,
    author: post.author,
    excerpt: post.excerpt,
    slug: post.slug,
    featured_image: post.featured_image || null
  }));
  
  fs.writeFileSync(
    path.join(__dirname, 'posts.json'),
    JSON.stringify(postsData, null, 2)
  );
  console.log('✓ Generated: /blog/posts.json');
}

function build() {
  console.log('Building blog...');
  const posts = getAllPosts();
  console.log(`Found ${posts.length} post(s)`);
  posts.forEach(post => {
    const postDir = path.join(POSTS_OUTPUT_DIR, post.slug);
    if (!fs.existsSync(postDir)) {
      fs.mkdirSync(postDir, { recursive: true });
    }
    const html = generatePostHTML(post);
    fs.writeFileSync(path.join(postDir, 'index.html'), html);
    console.log(`✓ Generated: /blog/posts/${post.slug}/`);
  });
  const blogIndexHtml = generateBlogIndexHTML(posts);
  fs.writeFileSync(BLOG_INDEX_PATH, blogIndexHtml);
  console.log('✓ Generated: /blog/index.html');
  // Homepage now loads posts dynamically via JavaScript
  generatePostsJSON(posts);
  console.log('\nBuild complete!');
}
build();
