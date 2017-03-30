
## Encode Font files

1. update main.css with new EOT file
2. update inline base64 encoded url with new string.

### how to use this tool
    node index.js <path-to-font> | pbcopy
example:

    node index.js app/source/storyfont-46.woff | pbcopy
    -> src: url(data:application/x-font-woff;charset=utf-8;base64,<base64EncodedStr>) format(woff)
 
The above will copy a string ready to be pasted into a CSS rule in the main.css file 
