import { notFound } from 'next/navigation';

export const runtime = 'edge';

const posts: Record<string, { title: string; date: string; content: string }> = {
    'minimalist-design': {
        title: 'The Art of Minimalist Design',
        date: 'February 12, 2025',
        content: `
      <p>Minimalism is not about removing things you love. It's about removing the things that distract you from it.</p>
      <p>In web design, this philosophy translates to:</p>
      <ul>
        <li><strong>Focus</strong>: What is the primary action?</li>
        <li><strong>Restraint</strong>: Just because you can add a feature, doesn't mean you should.</li>
        <li><strong>Typography</strong>: Let the words do the heavy lifting.</li>
      </ul>
      <p>When we strip away the excess, we're left with the essential. This is where true design happens.</p>
    `
    },
    'writing-better-code': {
        title: 'On Writing Better Code',
        date: 'February 5, 2025',
        content: `
      <p>Code is read much more often than it is written. Therefore, clarity is the most important attribute of code.</p>
      <p>Better code means:</p>
      <ul>
        <li><strong>Meaningful Naming</strong>: Variables should explain themselves.</li>
        <li><strong>Small Functions</strong>: A function should do one thing and do it well.</li>
        <li><strong>Consistency</strong>: Follow the established patterns of the codebase.</li>
      </ul>
    `
    },
    'power-of-constraints': {
        title: 'The Power of Constraints',
        date: 'January 28, 2025',
        content: `
      <p>Constraints are often seen as negatives, but they are actually the fuel for creativity.</p>
      <p>When you have infinite resources, you often produce bloated solutions. When you have strict limits—on bandwidth, on screen size, on budget—you are forced to innovate.</p>
    `
    },
    'sustainable-systems': {
        title: 'Building Sustainable Systems',
        date: 'January 20, 2025',
        content: `
      <p>A sustainable system is one that can be maintained indefinitely without collapse.</p>
      <p>In software, this means:</p>
      <ul>
        <li>Avoid "Hero Dependent" architectures.</li>
        <li>Document the "Why", not just the "How".</li>
        <li>Automate the boring stuff.</li>
      </ul>
    `
    },
    'future-web-dev': {
        title: 'The Future of Web Development',
        date: 'January 12, 2025',
        content: `
      <p>The future isn't just about faster frameworks. It's about the convergence of AI and the Web.</p>
      <p>We are moving from "Websites for Humans" to "Websites for Agents AND Humans". The protocols we build today (like IMAGXP) will define how information flows in this new era.</p>
    `
    }
};

export default function Post({ params }: { params: { slug: string } }) {
    const post = posts[params.slug];

    if (!post) {
        notFound();
    }

    return (
        <article className="prose prose-neutral prose-lg mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-light tracking-tight text-gray-900 mb-2">{post.title}</h1>
                <time className="text-sm text-gray-400 font-mono">{post.date}</time>
            </header>
            <div
                className="font-light text-gray-700 leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />
            <div className="mt-12 pt-8 border-t border-gray-100">
                <a href="/" className="text-sm text-gray-400 hover:text-gray-600">← Back to Writings</a>
            </div>
        </article>
    );
}
