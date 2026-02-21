import Link from 'next/link';

const posts = [
    { slug: 'minimalist-design', title: 'The Art of Minimalist Design', date: 'February 12, 2025', readTime: '5 min read', excerpt: 'Exploring how simplicity in design creates clarity, improves usability, and delivers a more meaningful user experience through intentional restraint.' },
    { slug: 'writing-better-code', title: 'On Writing Better Code', date: 'February 5, 2025', readTime: '7 min read', excerpt: 'A reflection on how writing clean, readable code is not just about functionality—it’s about creating something others can understand and maintain.' },
    { slug: 'power-of-constraints', title: 'The Power of Constraints', date: 'January 28, 2025', readTime: '6 min read', excerpt: 'How limitations in our tools and resources can actually lead to more creative solutions, stronger focus, and better final products.' },
    { slug: 'sustainable-systems', title: 'Building Sustainable Systems', date: 'January 20, 2025', readTime: '8 min read', excerpt: 'A deep dive into creating systems that are not just powerful, but maintainable, scalable, and designed to last beyond the initial launch.' },
    { slug: 'future-web-dev', title: 'The Future of Web Development', date: 'January 12, 2025', readTime: '9 min read', excerpt: 'Thoughts on where web development is heading—from frameworks and tools to the philosophy of building experiences that matter to users.' },
];

export default function Home() {
    return (
        <div className="space-y-12">
            {posts.map((post) => (
                <article key={post.slug} className="group">
                    <Link href={`/posts/${post.slug}`} className="block">
                        <div className="flex justify-between items-baseline">
                            <h2 className="text-xl text-gray-800 font-light group-hover:text-black transition-colors">
                                {post.title}
                            </h2>
                            <span className="text-gray-300 group-hover:text-gray-400 transition-colors">→</span>
                        </div>
                        <p className="mt-3 text-gray-500 font-light leading-relaxed text-sm">
                            {post.excerpt}
                        </p>
                        <div className="mt-3 flex items-center gap-3 text-xs text-gray-400 font-mono">
                            <time>{post.date}</time>
                            <span>·</span>
                            <span>{post.readTime}</span>
                        </div>
                    </Link>
                </article>
            ))}
        </div>
    );
}
