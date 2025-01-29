import PropTypes from 'prop-types';
import type { CodeComponent, CodeProps } from 'react-markdown/lib/ast-to-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import { codeStyle } from 'src/utils/code-style';

export const Code: CodeComponent = (props: CodeProps) => {
  const { children, className, inline, ...other } = props;

  const language = /language-(\w+)/.exec(className || '');

  return !inline && language ? (
    <SyntaxHighlighter
      language={language[1]}
      PreTag="div"
      style={codeStyle}
      {...other}
    >
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (
    <code
      className={className}
      {...other}
    >
      {children}
    </code>
  );
};

Code.propTypes = {
  children: PropTypes.any,
  className: PropTypes.string,
  inline: PropTypes.bool,
};
