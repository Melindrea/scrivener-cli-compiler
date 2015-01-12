'use strict';

var xmldoc = require('xmldoc'), fs = require('fs'),
    util = require('util'),
    _s = require('underscore.string'), sh = require('execSync');

/**
 * Load Scrivener project, returning the Draft as an object
 *
 * @param  {String} path
 * @param  {Object} config
 * @return {Object}
 */
module.exports = {
    load: function (path, config) {
        var scrivxPath = path + '/project.scrivx', projectScrivx, draft = [];

        try {
            projectScrivx = new xmldoc.XmlDocument(fs.readFileSync(scrivxPath, 'utf-8')),
            draft = ScrivenerParser.getDraft(projectScrivx, config, path);
        } catch (error) {
            throw error;
        }

        return draft;
    },

    write: function (draft, config, dry) {
        // console.log(draft);
    }
};

var ScrivenerParser = (function () {
    var parsedBinder = [];
    // [todo] - Needs to also be able to read in Front Matter and Back Matter
    function parseBinder(scrivx, config, projectPath) {
        var binder = scrivx.descendantWithPath('Binder').childWithAttribute('Type', 'DraftFolder').childNamed('Children');
        binder.eachChild(parseItem);

        mapWithParent(parsedBinder);

        parsedBinder = parsedBinder.filter(function (item) {
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

                item.content = sh.exec('pandoc /tmp/' + item.docId + '.html  -t markdown').stdout;
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
                item.synopsis = fs.readFileSync(item.synopsisPath).toString();
            } catch (err) {
                item.synopsis = false;
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
        getDraft: parseBinder
    }
}());

