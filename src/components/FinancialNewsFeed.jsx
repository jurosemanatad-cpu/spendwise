import React, { useState, useEffect } from 'react';

// Visually rich, contextual 2026 mock data fallback
const MOCK_ARTICLES = [
    {
        title: "Micro-Investing Trends in 2026: Navigating High-Yield Savings",
        description: "As automated finance tools evolve, retail investors are shifting away from traditional accounts toward AI-managed micro-portfolios.",
        source: { name: "FinTech Journal" },
        url: "#",
        urlToImage: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=500&auto=format&fit=crop&q=60"
    },
    {
        title: "How Gen-Z and Millennials Are Redefining 'Emergency Funds'",
        description: "A recent market analysis shows a massive increase in young adults using dynamic liquidity streams as secondary savings vehicles.",
        source: { name: "Global Wealth Pulse" },
        url: "#",
        urlToImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=60"
    }
];

export default function FinancialNewsFeed() {
    const [articles, setArticles] = useState([]);
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        async function fetchNews() {
            // Vite looks for variables prefixed with VITE_
            const apiKey = import.meta.env.VITE_NEWS_API_KEY;

            if (apiKey && navigator.onLine) {
                try {
                    const response = await fetch(
                        `https://newsapi.org/v2/everything?q=financial-literacy&sortBy=publishedAt&pageSize=2&apiKey=${apiKey}`
                    );
                    if (!response.ok) throw new Error("API configuration error");
                    
                    const data = await response.json();
                    if (data.articles && data.articles.length > 0) {
                        setArticles(data.articles);
                        setIsLive(true);
                        return;
                    }
                } catch (error) {
                    console.warn("Unable to fetch live feed, falling back to mock data.", error);
                }
            }
            
            // Default Fallback
            setArticles(MOCK_ARTICLES);
            setIsLive(false);
        }

        fetchNews();
    }, []);

    // Utilizing the precise leafCardStyle from the Dashboard to maintain the exact 2026 glass-morphism aesthetic
    const leafCardStyle = "bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-lg rounded-tr-[3rem] rounded-bl-[3rem] rounded-tl-xl rounded-br-xl p-5 transition-all hover:bg-white/50 dark:hover:bg-gray-800/50 mt-6";

    return (
        <div className={leafCardStyle}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Financial Insights</h2>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Daily educational literacy feed</p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                    isLive ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                }`}>
                    {isLive ? '● Live Feed' : 'Offline Demo Mode'}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((article, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-4 bg-white/20 dark:bg-gray-900/20 p-4 rounded-xl border border-white/10 hover:scale-[1.01] transition-transform duration-200">
                        {article.urlToImage && (
                            <img 
                                src={article.urlToImage} 
                                alt={article.title}
                                className="w-full sm:w-24 h-24 object-cover rounded-lg bg-gray-200 dark:bg-gray-700"
                            />
                        )}
                        <div className="flex flex-col justify-between flex-1">
                            <div>
                                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                                    {article.source.name}
                                </span>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 mt-0.5 leading-tight">
                                    {article.title}
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">
                                    {article.description}
                                </p>
                            </div>
                            <a 
                                href={article.url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-xs font-bold text-gray-900 dark:text-white hover:underline mt-3 inline-block"
                            >
                                Read Article →
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
