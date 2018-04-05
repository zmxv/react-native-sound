const patch = require('mpatch')
const inquirer = require('inquirer')
const recipes = {
	'android/**/build.gradle': [{
      pattern: 'dependencies {',
      patch: `
		compile project(':react-native-sound')`
    }]
}

Object.keys(recipes).forEach(file => {
    patch(file, [].concat(recipes[file]))
})

console.log('done!')