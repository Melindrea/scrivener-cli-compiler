scrivener-cli-compiler
======================

Project that reads a given Scrivener project and outputs the minidocuments as several ones, CLI based and does not need Scrivener installed

## Test folder
This has a few (completelly non-working!) Scrivener projects, with the
minimum amount of files required to test whatever needs to be tested

### Chapter without text
`./bin/scrivener-cli-compiler -p chapter-without-text [--dry]`

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


### Interaction with [grunt-epub](https://github.com/Melindrea/grunt-epub)
{
    // List of authors. Authors, contributors and editor all
    // follow the convention of having a "as" and a "name"
    "authors": [{
        "as": "Hogebrandt, Marie", // Use authorTemplate, LastName, FirstName
        "name": "Marie Hogebrandt" // If only one, it's ProjectProperties.FullName
    }],
    "contributors": [], // Doesn't exist in Scrivener
    "editor": null,// Doesn't exist in Scrivener

    // Exact names of the dates depends a little bit. Kindle requires
    // the dates to be in YYYY-MM-DD form (though may be only YYYY)
    // Overall, add dates that's relevant, like publishing, digital
    // publishing, etc.
    "dates": {
        "original-publication": "2014-03-21T09:44:33Z",
        "opf-publication": "2014-03-21T09:44:33Z"
    },

    // These are made into a single, comma-delimited list for a Subject
    // Doesn't exist in Scrivener
    "keywords": [
        "Urban Fantasy",
        "Svensk folktro"
    ],
    "language": "sv", // Doesn't exist in Scrivener
    "license": null, // Doesn't exist in Scrivener

    // A normal string, either publishing house or your own name
    "publisher": null, // Doesn't exist in Scrivener

    // The outline is very important, since that sets all the guides,
    // spine, etc. Each of the lists needs to have a proper order, but
    // the three keys (body, frontmatter, backmatter) do not.
    // The "name" is required to correspond to the name of the HTML file,
    // E.G, akt-01.html
    "outline": {
        // Items in the body can be nested deeper than 1 level, if they
        // should be nested in navigation
        "body": [
            {
                "name": "akt-01", // Detta blir andra sluggen
                "items": [ // Children
                    {
                        "name": "kapitel-01",
                        "title": "Kapitel 1"
                    },
                    {
                        "name": "mellanspel-01",
                        "title": "Mellanspel"
                    },
                    {
                        "name": "kapitel-02",
                        "title": "Kapitel 2"
                    },
                    {
                        "name": "kapitel-03",
                        "title": "Kapitel 3"
                    },
                    {
                        "name": "mellanspel-02",
                        "title": "Mellanspel"
                    },
                    {
                        "name": "kapitel-04",
                        "title": "Kapitel 4"
                    },
                    {
                        "name": "kapitel-05",
                        "title": "Kapitel 5"
                    }
                ],
                "title": "Akt I: Konsten att F\u00f6rf\u00f6ra" // Title
            },
            {
                "name": "akt-02",
                "items": [
                    {
                        "name": "kapitel-06",
                        "title": "Kapitel 6"
                    },
                    {
                        "name": "mellanspel-03",
                        "title": "Mellanspel"
                    },
                    {
                        "name": "kapitel-07",
                        "title": "Kapitel 7"
                    },
                    {
                        "name": "kapitel-08",
                        "title": "Kapitel 8"
                    },
                    {
                        "name": "mellanspel-04",
                        "title": "Mellanspel"
                    },
                    {
                        "name": "kapitel-09",
                        "title": "Kapitel 9"
                    },
                    {
                        "name": "kapitel-10",
                        "title": "Kapitel 10"
                    }
                ],
                "title": "Akt II: Konsten att F\u00f6rf\u00f6lja"
            },
            {
                "name": "akt-03",
                "items": [
                    {
                        "name": "kapitel-11",
                        "title": "Kapitel 12"
                    },
                    {
                        "name": "mellanspel-05",
                        "title": "Mellanspel"
                    },
                    {
                        "name": "kapitel-12",
                        "title": "Kapitel 12"
                    },
                    {
                        "name": "kapitel-13",
                        "title": "Kapitel 13"
                    },
                    {
                        "name": "kapitel-14",
                        "title": "Kapitel 14"
                    },
                    {
                        "name": "mellanspel-06",
                        "title": "Mellanspel"
                    },
                    {
                        "name": "kapitel-15",
                        "title": "Kapitel 15"
                    },
                    {
                        "name": "epilog",
                        "title": "Epilog"
                    }
                ],
                "title": "Akt III: Konsten att F\u00f6rg\u00f6ra"
            }
        ],
        // For both front- and backmatter, the name needs to be one of
        // the following:
        // cover, colophon, title-page, toc, index, glossary,
        // acknowledgements, bibliography, copyright-page,
        // dedication, epigraph, foreword, loi, lot, notes,
        // preface.
        // toc = Table of contents, loi = List of Illustrations,
        // lot = List of Tables.
        // These are used in the Guide to map files to landmarks.
        // Kindle requires a cover and a toc

        // Anything that goes at the end of the novel. Suggestion of Folder with names
        // `Front Matter` and `Back Matter`, under which is a Folder for each
        // type, which are reflected under the specific config
        "backmatter": [
            {
                "name": "colophon",
                "title": "Kolophon"
            }
        ],

        // Anything that goes at the front of the novel
        "frontmatter": [
            {
                "name": "cover",
                "title": "Framsida"
            }
        ]
    },
    // ProjectProperties.ProjectTitle
    "title": "Sk\u00e4rvor av det f\u00f6rg\u00e5ngna",

    // A unique identifier. This can be almost anything, recommended is
    // ISBN, or URI or similar. The scheme is non-standard, but
    // recommended to match what kind of identifier
    "id": {
        "value": "skarvor-av-det-forgangna2014-03-21-09-44-33-012690",
        "scheme": "UUID"
    },
    "description": "Some description ..."
}
