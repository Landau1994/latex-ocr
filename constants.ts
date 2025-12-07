export const DEFAULT_PREAMBLE = `\\documentclass{ctexbook}
% === 必须添加的宏包 ===
\\usepackage{amssymb} % <--- 解决 \\mathbb 报错的核心
\\usepackage{amsmath} % 建议同时添加，提供更强的数学公式支持
\\usepackage{amsthm} % 关键：加载定理宏包
% === 中文支持 (假设你用的是 xelatex) ===
%\\usepackage{ctex} 
\\usepackage{hyperref} % 处理 \\url 链接
\\usepackage{geometry}

\\newtheorem{theorem}{定理}
\\newtheorem{identity}{恒等式}

\\newtheorem*{theorem*}{定理}
\\newtheorem*{identity*}{恒等式}

\\geometry{
\ta4paper,       % 设置纸张为 A4
\tleft=2.5cm,    % 左边距
\tright=2.5cm,   % 右边距
\ttop=2.5cm,     % 上边距
\tbottom=2.5cm,  % 下边距
}`;

export const DEFAULT_PRESERVED_TERMS = "adeles, ideles, adelic";

export const SAMPLE_IMAGE_PLACEHOLDER = "https://picsum.photos/800/600";