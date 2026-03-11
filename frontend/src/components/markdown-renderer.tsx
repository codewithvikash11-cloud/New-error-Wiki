'use client'

import ReactMarkdown from "react-markdown"
import { Light as SyntaxHighlighter } from "react-syntax-highlighter"
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs"

export default function MarkdownRenderer({ content }: { content: string }) {
    return (
        <ReactMarkdown
            components={{
                code(props: any) {
                    const { children, className, node, ref, ...rest } = props
                    const match = /language-(\w+)/.exec(className || '')
                    return match ? (
                        <SyntaxHighlighter
                            {...rest}
                            PreTag="div"
                            language={match[1]}
                            style={atomOneDark as any}
                            className="rounded-lg my-6 !bg-[#1E1E1E]"
                        >
                            {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                    ) : (
                        <code {...rest} className={`${className} bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-md font-mono text-sm`}>
                            {children}
                        </code>
                    )
                },
                h2(props: any) {
                    const id = String(props.children).toLowerCase().replace(/[^\w]+/g, '-');
                    return <h2 id={id} className="scroll-mt-20">{props.children}</h2>
                },
                h3(props: any) {
                    const id = String(props.children).toLowerCase().replace(/[^\w]+/g, '-');
                    return <h3 id={id} className="scroll-mt-20">{props.children}</h3>
                }
            }}
        >
            {content}
        </ReactMarkdown>
    )
}
