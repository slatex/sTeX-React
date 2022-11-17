import Token from 'markdown-it/lib/token';

const regSelectOpenClose = /_open|_close/g;
function getTokenTypeByToken(token: Token) {
  let cleanedType = 'unknown';

  if (token.type) {
    cleanedType = token.type.replace(regSelectOpenClose, '');
  }

  switch (cleanedType) {
    case 'heading': {
      cleanedType = `${cleanedType}${token.tag.substr(1)}`;
      break;
    }
  }

  return cleanedType;
}

let uuid = new Date().getTime();
function getNodeID() {
  uuid++;
  return `mdnode_${uuid.toString(16)}`;
}

export interface AstNode {
  type: string;
  sourceType: string;
  sourceInfo: string;
  sourceMeta: any;
  block: boolean;
  markup: string;
  key: string;
  content: any;
  tokenIndex: number;
  index: number;
  attributes: any;
  children: AstNode[];
}

function createNode(token: Token, tokenIndex: number): AstNode {
  const type = getTokenTypeByToken(token);

  let attributes = {};

  if (token.attrs) {
    attributes = token.attrs.reduce((prev, curr) => {
      const [name, value] = curr;
      return { ...prev, [name]: value };
    }, {});
  }

  return {
    type,
    sourceType: token.type,
    sourceInfo: token.info,
    sourceMeta: token.meta,
    block: token.block,
    markup: token.markup,
    key: getNodeID(),
    content: token.content,
    tokenIndex,
    index: 0,
    attributes,
    children: tokensToAST(token.children),
  };
}

/**
 *
 * @param {Array<{type: string, tag:string, content: string, children: *, attrs: Array}>}tokens
 * @return {Array}
 */
export default function tokensToAST(tokens: Token[] | null): AstNode[] {
  const stack: AstNode[][] = [];
  let children = [] as AstNode[];

  if (!tokens || tokens.length === 0) {
    return [];
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const astNode = createNode(token, i);

    if (
      !(
        astNode.type === 'text' &&
        astNode.children.length === 0 &&
        astNode.content === ''
      )
    ) {
      astNode.index = children.length;

      if (token.nesting === 1) {
        children.push(astNode);
        stack.push(children);
        children = astNode.children;
      } else if (token.nesting === -1) {
        children = stack.pop() || [];
      } else if (token.nesting === 0) {
        children.push(astNode);
      }
    }
  }

  return children;
}

export function toText(t: AstNode[], index: number[]) {
  if (!t?.length) return '';
  let v = '';
  for (let i = 0; i < t.length; i++) {
    const node = t[i];
    let c;
    if (node.content?.linkTarget?.ptr) {
      c = node.content.linkTarget.ptr.toString();
    } else {
      c = node.content;
    }
    v += `${[...index, i].join(':')} ${node.type} [${c}]\n`;
    v += toText(node.children, [...index, i]);
  }
  return v;
}
