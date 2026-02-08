import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./harvestNote.css";

const HarvestNote = ({ markdown }) => {
  return (
    <div className="harvest-note">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => <h1 className="harvest-h1" {...props} />,
          h2: ({ ...props }) => <h2 className="harvest-h2" {...props} />,
          h3: ({ ...props }) => <h3 className="harvest-h3" {...props} />,
          p: ({ ...props }) => <p className="harvest-p" {...props} />,
          ul: ({ ...props }) => <ul className="harvest-ul" {...props} />,
          ol: ({ ...props }) => <ol className="harvest-ol" {...props} />,
          li: ({ ...props }) => <li className="harvest-li" {...props} />,
          a: ({ href, children }) => (
            <a
              className="harvest-link"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          blockquote: ({ ...props }) => (
            <blockquote className="harvest-quote" {...props} />
          ),
          code: ({ inline, children }) => {
            if (inline) {
              return <code className="harvest-inline-code">{children}</code>;
            }
            return (
              <pre className="harvest-code">
                <code>{children}</code>
              </pre>
            );
          },
          table: ({ ...props }) => (
            <div className="harvest-table-wrap">
              <table className="harvest-table" {...props} />
            </div>
          ),
          thead: ({ ...props }) => <thead className="harvest-thead" {...props} />,
          tbody: ({ ...props }) => <tbody className="harvest-tbody" {...props} />,
          tr: ({ ...props }) => <tr className="harvest-tr" {...props} />,
          th: ({ ...props }) => <th className="harvest-th" {...props} />,
          td: ({ ...props }) => <td className="harvest-td" {...props} />,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

export default HarvestNote;
