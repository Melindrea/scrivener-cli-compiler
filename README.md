scrivener-cli-compiler
======================

Project that reads a given Scrivener project and outputs the minidocuments as several ones, CLI based and does not need Scrivener installed

## Test folder
This has a few (completelly non-working!) Scrivener projects, with the
minimum amount of files required to test whatever needs to be tested

### Chapter without text

```
{
    "depth": 2,
    "settings": [{
        "text": false, // First level (chapter) does not have independent text
    }, {
        "text": true, // Second level (scene) has independent text,
        "title": false, // Second level should not show the title
        "concat": true, // Second level should also be concatenated
        "divider": "SCENE ENDS" // Only needed if Concat, and can then be any kind of text
    }]
}
```
