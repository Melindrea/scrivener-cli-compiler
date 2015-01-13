'use strict';

var xmldoc = require('xmldoc'), fs = require('fs'),
    util = require('util'),
    _s = require('underscore.string'),
    sh = require('execSync'),
    Template = require('template'), template = new Template();

/**
 * Load Scrivener project, returning the Draft as an object
 *
 * @param  {String} path
 * @param  {Object} config
 * @return {Object}
 */
module.exports = {
    loadProject: function (path, config) {
        return ScrivenerParser.getProject(path, config);
    },

    loadDraft: function (path, config, type) {
        var draft = [];

        try {
            draft = ScrivenerParser.getDraft(ScrivenerParser.getProject(path, config), config, path);
        } catch (error) {
            throw error;
        }

        return draft;
    },

    write: function (draft, config, path, dry) {
        var files = [], currentFile = false, fileId = 1;

        draft.forEach(function (item) {
            var itemConfig = config.levels[item.depth], currentContent;
            if ('slug' in itemConfig) {
                if (currentFile) {
                    files.push(currentFile);
                    fileId++;
                }
                currentFile = {
                    name: itemConfig.slug + '-' + fileId + '.' + config.ext,
                    content: null
                };
            }

            if (itemConfig.text) {
                currentContent = currentFile.content || '';

                template.render(itemConfig.template, item, function (err, html) {
                    if (err) {
                        throw err;
                    }
                    currentFile.content = currentContent + html;
                });
            }
        });

        files.push(currentFile);
        try {
            fs.mkdir(path);
        } catch (e) {}

        files.forEach(function (file) {
            var fileName = path + file.name;
            template.render(config.template, file, function (err, html) {
                if (err) {
                    throw err;
                }

                fs.writeFile(fileName, html);
            });
        });
    }
};

var ScrivenerParser = (function () {
    var parsedBinder = [];
    function getProject(path, config) {
        var scrivxPath = path + '/project.scrivx', projectScrivx;

        try {
            projectScrivx = new xmldoc.XmlDocument(fs.readFileSync(scrivxPath, 'utf-8'));
        } catch (error) {
            throw error;
        }

        return projectScrivx;
    }

    // [todo] - Needs to also be able to read in Front Matter and Back Matter
    function parseBinder(scrivx, config, projectPath) {
        var binder = scrivx.descendantWithPath('Binder').childWithAttribute('Type', 'DraftFolder').childNamed('Children');
        binder.eachChild(parseItem);

        mapWithParent(parsedBinder);

        parsedBinder = parsedBinder.filter(function (item) {
            var tmpPath;
            // This is deeper than wanted
            if (item.depth >= config.depth) {
                return false;
            } else if (! item.shouldCompile) {
                return false;
            }

            item.filePath = projectPath + '/Files/Docs/' + item.docId + '.rtf';
            item.synopsisPath = projectPath + '/Files/Docs/' + item.docId + '_synopsis.txt';

            try {
                sh.exec(
                    'soffice --headless --convert-to html:HTML --outdir ' +
                    '/tmp ' + item.filePath
                );
            } catch (err) {
                console.error(err.stack)
                if (err.pid) {
                    console.log(
                        '%s (pid: %d) exited with status %d',
                        err.file,
                        err.pid,
                        err.status
                    );
                }
            }
            try {
                tmpPath = '/tmp/' + item.docId + '.html';
                fs.readFileSync(tmpPath);
                item.text = sh.exec('pandoc ' + tmpPath + ' -t markdown').stdout;
            } catch (err) {
                return false;
            }

            try {
                item.synopsis = fs.readFileSync(item.synopsisPath).toString();
            } catch (err) {
                item.synopsis = null;
            }

            return true;
        });

        return parsedBinder;
    }

    var stackLevel = 0;
    function parseItem(item, index, context) {
        var children = item.childNamed('Children');

        var object = {};

        object.title = item.valueWithPath('Title');
        object.docId = parseInt(item.attr.ID, 10);
        object.slug = _s.slugify(object.title);
        object.shouldCompile = (item.valueWithPath('MetaData.IncludeInCompile') === 'Yes') ? true : false;
        object.targetWordCount = parseInt(item.valueWithPath('TextSettings.Target'), 10);
        object.depth = stackLevel;

        parsedBinder.push(object);

        if (children) {
            stackLevel++;
            children.eachChild(parseItem);
            stackLevel--;
        }
    }

    function mapWithParent(items) {
        var item, parent;
        for (var index = 0; index < items.length; index++) {
            item = items[index];
            if (item.depth > 0) {
                item.parent = findParentSlug(items, index, item.depth);
            }
        }
    }

    function findParentSlug(items, childIndex, depth) {
        var item;
        for (var index = childIndex; index > -1; index--) {
            item = items[index];
            if (item.depth < depth) {
                return item.slug;
            }
        }
        return false;
    }

    return {
        getDraft: parseBinder,
        getProject: getProject
    }
}());

