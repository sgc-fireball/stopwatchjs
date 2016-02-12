# HRDNS StopWatchJS
StopWatchJS is a javascript clone from [Stopwatch Component](https://github.com/symfony/stopwatch).<br>
The Symfony "Stopwatch Component" is copyright by Fabien Potencier.<br>
Please read his [license](https://raw.githubusercontent.com/symfony/stopwatch/master/LICENSE).<br>
<br>
*The API is unstable and can change from commit to commit!*

## Installation
### Composer
```bash
composer require sgc-fireball/stopwatchjs
```

### Bower
coming soon ...

## Usage
```javascript
define(['StopWatch/StopWatch'],function(StopWatch){
    StopWatch.start('loading','section');
    // do something
    StopWatch.openSection();
    // do something
    StopWatch.start('eventName','category');
    // do something
    StopWatch.stop('eventName');
    // do something
    StopWatch.stopSection('nameOfSection');
    // do something
    StopWatch.stop('loading');
});
```

## Copyright and License
Richard Hülsberg - [rh+github@hrdns.de](mailto:rh+github@hrdns.de) - <https://www.hrdns.de>
You can read the license [here](LICENSE.md)

## Greets and Thanks
- [phpjs.org](http://phpjs.org/)
- [Fabien Potencier](https://github.com/symfony/stopwatch)
