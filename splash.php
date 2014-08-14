#!/usr/bin/env php
<?php

/**
 *
 * ios app icon and splash generator
 * built for phonegap, but will work for any app
 *
 * author: Devin Smith (http://devin.la)
 *
 */
 

$projectPath = 'platforms/ios/Cockpit/Resources/';		// path of ios project

$images = [
	'backgrounds' => [
		'items' => [
			['size' => [320,480], 'name' => 'Default~iphone'],
//			['size' => [480,320], 'name' => 'Default-Landscape~iphone'],
			['size' => [768,1024], 'name' => 'Default-Portrait~ipad'],
			['size' => [1024,768], 'name' => 'Default-Landscape~ipad'],
			['size' => [640,960], 'name' => 'Default-568h@2x~iphone'],
			['size' => [960,640], 'name' => 'Default-Landscape@2x~iphone'],
//			['size' => [639,1136], 'name' => 'Default-568h@2x~iphone'],
			['size' => [1536,2016], 'name' => 'Default-Portrait@2x~ipad'],
			['size' => [2048,1536], 'name' => 'Default-Landscape@2x~ipad']
		],
		'path' => $projectPath.'splash/',
		'color' => '202228'
	]
];

echo "Creating iOS icons...";

foreach ($images as $type) {
	if (!$type['items']) {
		continue;
	}

	foreach ($type['items'] as $item) {
		$cmd = 'convert -size '.$item['size'][0].'x'.$item['size'][1].' canvas:#'.$type['color'].' '.$type['path'].$type['prefix'].$item['name'].'.png';
		exec($cmd);
	}
}

echo "\033[32m complete!\033[37m
";
