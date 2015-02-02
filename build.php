#!/usr/bin/env php
<?php

/**
 * Download and build local assets for phonegap
 * 
 * requires php, wget, gunzip
 *
 */

$cleanPaths = array(
	'/Users/arzynik/Sites/crunchbutton/cache/data/*',
	'/Users/arzynik/Sites/crunchbutton/cache/min/*'
);
foreach ($cleanPaths as $p) {
	shell_exec('rm -Rf '.$p);
}

shell_exec('phonegap build ios');
