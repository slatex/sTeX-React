import { LinearProgress } from '@mui/material';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { HighlightContext, mmtHTMLToReact } from './mmtParser';

const FIXEDVAL = `<body style="width:921.4425px">
  <div style="font-size:15.0px;width:517.5px;padding-left:201.97124px;padding-right:201.97124px;line-height:1.2" class="body">
    <div stex:sourceref="file:/home/demuelle/texlive/texmf-dist/tex/latex/base/article.cls#20087.640.3:20096.640.12" class="VFil"></div><div property="stex:language" style="display:none;" resource="en" stex:visible="false" stex:sourceref="http://mathhub.info/smglom/algebra/Boolean-algebra.en.tex#42.3.1:57.3.16" class="hbox">&#8205;</div><a id="Doc-Start" name="Doc-Start" stex:sourceref="http://mathhub.info/smglom/algebra/Boolean-algebra.en.tex#42.3.1:57.3.16" class="pdfdest"></a><div property="stex:doctitle" style="display:none;" resource="" stex:visible="false" stex:sourceref="http://mathhub.info/smglom/algebra/Boolean-algebra.en.tex#59.4.1:129.4.71" class="hbox">Boolean Algebra</div><div class="sidebar"><b style="font-size: larger">Theory: Boolean-algebra</b></div><span property="stex:theory" resource="http://mathhub.info/smglom/algebra?Boolean-algebra" stex:sourceref="http://mathhub.info/smglom/algebra/Boolean-algebra.en.tex#59.4.1:420.13.17"><div property="stex:header" style="display:none;" resource="" stex:visible="false" stex:sourceref="http://mathhub.info/smglom/algebra/Boolean-algebra.en.tex#59.4.1:129.4.71" class="hbox"><span property="stex:language" resource="en">&#8205;</span><span property="stex:signature" resource="">&#8205;</span><span property="stex:metatheory" resource="http://mathhub.info/sTeX/meta?Metatheory">&#8205;</span></div><div property="stex:import" style="display:none;" resource="http://mathhub.info/smglom/algebra?complemented-lattice" stex:visible="false" stex:sourceref="http://mathhub.info/smglom/algebra/Boolean-algebra.en.tex#133.5.3:167.5.37" class="hbox">&#8205;</div><div property="stex:import" style="display:none;" resource="http://mathhub.info/smglom/algebra?distributive-lattice" stex:visible="false" stex:sourceref="http://mathhub.info/smglom/algebra/Boolean-algebra.en.tex#171.6.3:205.6.37" class="hbox">&#8205;</div><div class="sidebar"><span style="display:inline">Constant
<span style="display:inline" data-overlay-link-click="/:sTeX/declaration?http://mathhub.info/smglom/algebra?Boolean-algebra?Boolean-algebra&amp;language=en" data-overlay-link-hover="/:sTeX/fragment?http://mathhub.info/smglom/algebra?Boolean-algebra?Boolean-algebra&amp;language=en" class="propbtn">
            Boolean-algebra
</span><code>(\Boolean-algebra)</code></span></div><div property="stex:symdecl" style="display:none;" resource="http://mathhub.info/smglom/algebra?Boolean-algebra?Boolean-algebra" stex:visible="false" stex:sourceref="http://mathhub.info/smglom/algebra/Boolean-algebra.en.tex#209.7.3:239.9.3" class="hbox"><span property="stex:args" style="display:none;" resource="" stex:visible="false">&#8205;</span><span property="stex:macroname" style="display:none;" resource="Boolean-algebra" stex:visible="false">&#8205;</span></div><span property="stex:definition" resource="" stex:sourceref="http://mathhub.info/smglom/algebra/Boolean-algebra.en.tex#239.9.3:420.13.17">
        <div style="width:517.5px;min-width:517.5px;" class="paragraph"></div>
        <div style="width:517.5px;min-width:517.5px;" stex:sourceref="http://mathhub.info/smglom/algebra/Boolean-algebra.en.tex#239.9.3:402.12.29" class="paragraph"><span style="font-weight:bold;font-size:100%;" stex:sourceref="http://mathhub.info/smglom/algebra/Boolean-algebra.en.tex#239.9.3:261.10.3" class="resetfont">Definition</span>
          A
<span property="stex:OMID" resource="http://mathhub.info/smglom/algebra?complemented-lattice?complemented#CUSTOM-" id="57860363" stex:sourceref="http://mathhub.info/smglom/algebra/Boolean-algebra.en.tex#263.10.5:305.10.47" class="hasoverlay-parent"><span data-highlight-parent="57860363" property="stex:comp" resource="http://mathhub.info/smglom/algebra?complemented-lattice?complemented" data-overlay-link-click="/:sTeX/declaration?http://mathhub.info/smglom/algebra?complemented-lattice?complemented&language=en" data-overlay-link-hover="/:sTeX/fragment?http://mathhub.info/smglom/algebra?complemented-lattice?complemented&language=en" class="group-highlight symcomp">complemented</span></span>,
<span property="stex:OMID" resource="http://mathhub.info/smglom/algebra?distributive-lattice?distributive-lattice#CUSTOM-" id="112530994" stex:sourceref="http://mathhub.info/smglom/algebra/Boolean-algebra.en.tex#310.11.3:360.11.53" class="hasoverlay-parent"><span data-highlight-parent="112530994" property="stex:comp" resource="http://mathhub.info/smglom/algebra?distributive-lattice?distributive-lattice" data-overlay-link-click="/:sTeX/declaration?http://mathhub.info/smglom/algebra?distributive-lattice?distributive-lattice&language=en" data-overlay-link-hover="/:sTeX/fragment?http://mathhub.info/smglom/algebra?distributive-lattice?distributive-lattice&language=en" class="group-highlight symcomp">distributive lattice</span></span>
          is

<div data-collapsible="true">
<span>I will be ignored</span>
<span data-collapse-title="true">I am title1</span>
<span >I will be also ignored</span>
<span data-collapse-title="true">I am title2</span>
<span>You shall not see me</span>
<span data-collapse-body="true">I am body1</span>
<span>I am hiding</span>
<span data-collapse-body="true">I am body2</span>
<span>You can't see me.</span>
</div>
          called a
<span data-highlight-parent="-1712923880" property="stex:definiendum" resource="http://mathhub.info/smglom/algebra?Boolean-algebra?Boolean-algebra" id="-1712923880" data-overlay-link-click="/:sTeX/declaration?http://mathhub.info/smglom/algebra?Boolean-algebra?Boolean-algebra&language=en" data-overlay-link-hover="/:sTeX/fragment?http://mathhub.info/smglom/algebra?Boolean-algebra?Boolean-algebra&language=en" stex:sourceref="http://mathhub.info/smglom/algebra/Boolean-algebra.en.tex#376.12.3:401.12.28" class="group-highlight hasoverlay-parent definiendum">Boolean algebra</span>.
</div>
        <div style="margin-bottom:9.0px;" stex:sourceref="http://mathhub.info/smglom/algebra/Boolean-algebra.en.tex#404.13.1:420.13.17" class="vskip"></div></span></span><div stex:sourceref="http://mathhub.info/smglom/algebra/Boolean-algebra.en.tex#436.15.1:449.15.14" class="VFil"></div><div stex:sourceref="http://mathhub.info/smglom/algebra/Boolean-algebra.en.tex#436.15.1:449.15.14" class="VFil"></div>
  </div>
</body>`;
export function ContentFromUrl({
  url,
  modifyRendered = (n) => n,
  skipSidebar = false,
}: {
  url: string;
  modifyRendered?: (node: any) => any;
  skipSidebar?: boolean;
}) {
  const [rendered, setRendered] = useState<any>(<></>);
  const [isLoading, setIsLoading] = useState(false);

  const [highlightedParentId, setHighlightedParentId] = useState('');
  const value = useMemo(
    () => ({ highlightedParentId, setHighlightedParentId }),
    [highlightedParentId]
  );

  useEffect(() => {
    if (!url?.length) return;
    setIsLoading(true);
    axios
      .get(url)
      .catch((_e) => null)
      .then((r) => {
        setIsLoading(false);
        let toShow;
        /*if (FIXEDVAL.length > 0) {
          r.data = FIXEDVAL;
        }*/
        if (r) toShow = mmtHTMLToReact(r.data, skipSidebar);
        else
          toShow = <span style={{ color: 'red' }}>Error loading: {url}</span>;
        setRendered(toShow);
      });
  }, [url, skipSidebar]);

  if (isLoading) {
    return (
      <>
        <span style={{ fontSize: 'smaller' }}>{url}</span>
        <LinearProgress />
      </>
    );
  }
  return (
    <HighlightContext.Provider value={value}>
      <div {...{ 'section-url': url }}>{modifyRendered(rendered)}</div>
    </HighlightContext.Provider>
  );
}
