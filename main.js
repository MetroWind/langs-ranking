const LABELS = [
    "启蒙",
    "工作最爱",
    "摸鱼最爱",
    "最影响我的",
    "使用时间最长的",
    "最奇怪",
    "最想安利的",
    "写码一时爽，读码火葬场",
    "最致郁",
    "最有趣",
    "最被低估的",
    "最被高估的",
    "我为啥会喜欢这个？",
    "这是给人用的？",
    "总有一天能学会",
    "总有一天能用上",
];

class SVG
{
    constructor(labels, langs, columns, gap, total_width, cell_height)
    {
        this.labels = labels;
        this.langs = langs;
        this.columns = columns;
        this.gap = gap;
        this.total_width = total_width;
        this.cell_height = cell_height;
        this.cell_width = (this.total_width - (this.columns - 1) * this.gap) / this.columns;
    }

    #svg(style, body_nodes)
    {
        // This bug requires the SVG to have explicit width and
        // height: https://bugzilla.mozilla.org/show_bug.cgi?id=700533
        return `
<svg viewBox="-20 0 ${this.total_width + 40} 840" width="${this.total_width + 40}" height="840" xmlns="http://www.w3.org/2000/svg">
  <style>
    <![CDATA[
${style}
    ]]>
  </style>
${body_nodes}
</svg>`;
    }

    #svgBody(title_nodes, table_nodes, footer_nodes)
    {
        return `${title_nodes} ${table_nodes} ${footer_nodes}`;
    }

    #svgTitle(title, subtitle)
    {
        return `<text lang="zh-CN" x="${this.total_width/2}" y="100" font-size="36" text-anchor="middle">${title}</text>
<text lang="zh-CN" x="${this.total_width/2}" y="140" text-anchor="middle">${subtitle}</text>`;
    }

    #svgTable()
    {
        var result = "";
        for(let i = 0; i < this.labels.length; i++)
        {
            let x = (this.cell_width + this.gap) * (i % this.columns);
            let y = (this.cell_height + this.gap) * Math.floor(i / this.columns) + 170;
            result += `<g>
  <mask id="Mask${i}">
    <rect class="Cell" x="${x}" y="${y}" />
  </mask>
  <rect class="Cell" x="${x}" y="${y}" />
  <text class="Lang" x="${x + this.cell_width / 2}" y="${y + 64.4} " text-anchor="middle" fill="black" mask="url(#Mask${i})">
${this.langs[i]}</text>
  <text lang="zh-CN" class="Label" x="${x + this.cell_width / 2}" y="${y + this.cell_height - 14} " text-anchor="middle" fill="black">
${this.labels[i]}
  </text>
</g>`
        }
        return result;
    }

    #svgFooter()
    {
        return `<text lang="zh-CN" id="Footer" x="${this.total_width / 2}" y="810" text-anchor="middle" font-size="15">代码：https://github.com/MetroWind/langs-ranking</text>`;
    }

    #svgStyle()
    {
        return `text
{
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
               Roboto, Oxygen-Sans, Ubuntu, Cantarell,
               "Helvetica Neue", sans-serif;
    fill: black;
}

text.Label
{
    font-size: 18px;
}

text.Lang
{
    font-size: 28.8px;
}

.Cell
{
width: ${this.cell_width}px;
height: ${this.cell_height}px;
stroke: none;
fill: #eee;
}
`;
    }

    generate()
    {
        return this.#svg(
            this.#svgStyle(),
            this.#svgBody(
                this.#svgTitle("编程语言喜好表", "🔗 https://mws.rocks/lang-ranks/"),
                this.#svgTable(),
                this.#svgFooter()))
    }
}

function getLangs()
{
    var result = [];
    document.querySelectorAll('.Cell input[type="text"]').forEach((node) => {
        if(node.value === "")
        {
            result.push("C++");
        }
        else
        {
            result.push(node.value);
        }
    });
    return result;
}

function draw()
{
    let svg = new SVG(LABELS, getLangs(), 4, 4, 1000, 147);
    let svg_str = svg.generate();
    console.log(svg_str);

    let img = new Image();
    img.onload = function() {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(img, 0, 0);
        const link = document.createElement("a");
        link.setAttribute('download', 'lang-ranking.png');
        link.setAttribute('href', canvas.toDataURL("image/png"));
        link.click();
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg_str);

}

function registerChangeListeners()
{
    document.querySelectorAll('.Cell input[type="text"]').forEach((node, i) => {
        node.addEventListener("change", (_) => {
            var langs = JSON.parse(window.localStorage.getItem("langs"));
            if(node.value === "")
            {
                langs[i] = null;
            }
            else
            {
                langs[i] = node.value;
            }
            window.localStorage.setItem("langs", JSON.stringify(langs));
        });
    });
}

function initLangs()
{
    var langs = JSON.parse(window.localStorage.getItem("langs"));
    const inputs = document.querySelectorAll('.Cell input[type="text"]');
    if(langs === null)
    {
        langs = new Array(inputs.length);
        for(var i = 0; i < inputs.length; i++)
        {
            langs[i] = null;
        }
        window.localStorage.setItem("langs", JSON.stringify(langs));
    }
    else
    {
        var size = inputs.length;
        if(size > langs.length)
        {
            size = langs.length;
        }
        for(var i = 0; i < size; i++)
        {
            if(langs[i] === null)
            {
                inputs[i].value = "";
            }
            else
            {
                inputs[i].value = langs[i];
            }
        }
    }
}

function reset()
{
    document.querySelectorAll('.Cell input[type="text"]').forEach((node) => {
        node.value = "";
    });
    window.localStorage.removeItem("langs");
    initLangs();
}

document.querySelector("a#BtnGenImage").addEventListener("click", draw);
document.querySelector("a#BtnClear").addEventListener("click", reset);
registerChangeListeners();
initLangs();
