const { faker, allFakers } = require('@faker-js/faker');
const properCase = require('proper-case');

// List of all types of Fakers. We specify this explicitly since there is
// no easy way to filter out these from the other objects on the faker module.
const fakerTypes = [
    "datatype",
    "airline",
    "animal",
    "color",
    "commerce",
    "company",
    "database",
    "date",
    "finance",
    "git",
    "hacker",
    "image",
    "internet",
    "location",
    "lorem",
    "music",
    "person",
    "number",
    "phone",
    "science",
    "string",
    "system",
    "vehicle",
    "word"
]

// Creates the scaffolds for Enum options that Insomnia's Template Tags expect
populateFakerOptions = function (someArray) {
    return someArray.sort().map(function (key) {
        return {
            displayName: properCase(key),
            value: key
        }
    });
}

// customFaker = () => faker // For Debug

// Creates Faker Sub Types and hides them so that they only show when the
// parent Type is selected
populateFakerSubOptions = function () {
    return fakerTypes.map(function (fakerType) {
        var fakerTypeOptions = populateFakerOptions(Object.keys(faker[fakerType]).filter(item => item != "faker"))
        return {
            displayName: properCase(fakerType),
            type: 'enum',
            defaultValue: "",
            options: fakerTypeOptions,
            hide: args => fakerType != args[0].value
        };
    });
}

populateFakerLocalizationOptions = function() {
    return Object.keys(allFakers).sort().map(function(locale) {
        return {
            displayName: locale,
            value: locale
        }
    });
}

module.exports.templateTags = [{
    name: 'faker',
    displayName: 'Fake Data',
    description: 'Generate Faker data in Insomnia',
    args: [
        {
            displayName: 'Type',
            type: 'enum',
            options: populateFakerOptions(fakerTypes)
        }
    ]
    .concat(populateFakerSubOptions())
    .concat([
        {
            displayName: 'Localization',
            type: 'enum',
            options: populateFakerLocalizationOptions(),
            defaultValue: 'en'
        }
    ]),
    
    async run(context, type, ...args) {
        // Since we dynamically generate the Faker Type Sub Options, we
        // don't know which argument its stored at, so lets look it up
        var fakerTypeIndex = fakerTypes.indexOf(type);
        // Check to see if we have selected a Sub Type Value
        var subTypeValue = args[fakerTypeIndex];
        // If not, be sure to select the first value from the correct Faker Type
        if (subTypeValue == "") {
            subTypeValue = this.args[fakerTypeIndex + 1].options[0].value;
        }
        // Setup faker locale for i18n support
        var localization = args.slice(-1)[0];

        var myFaker = allFakers[localization];

        var generatedValue = myFaker[type][subTypeValue]()

        if(typeof generatedValue != "string")
            try {
                // Attempt to parse as list of arguments
                return Array.apply(null, generatedValue.split(','));
            } catch (err) {
                try {
                    // Attempt to parse arguments as JSON object or list
                return JSON.stringify(generatedValue);
                } catch (err) {
                    console.error(err)                   
                }
            }
        else
            return generatedValue;
    }
}];

