<?php

if (!$_SERVER['SERVER_NAME'] OR strpos($_SERVER['SERVER_NAME'], 'local.') !== FALSE OR $_SERVER['SERVER_NAME'] == 'localhost' OR strpos($_SERVER['SERVER_NAME'], '.local') !== FALSE)
{
	define('ENVIRONMENT', 'local');
	error_reporting('E_ALL');
}
else
{
	define('ENVIRONMENT', 'live');
	error_reporting(0);
}

// Templating engine
define('EXT', ".html");
define('PATH_INFO', $_SERVER["PATH_INFO"]);
$page_folder = "content";
$cache_folder = "content/cache";

if($_SERVER["PATH_INFO"])
{
	$page = file_exists($page_folder.PATH_INFO.EXT) ? PATH_INFO.EXT : $page_folder.'errors/404'.EXT;
}
else
{
	$page = 'home'.EXT;
}

// Look for cached file
if (file_exists($cache_folder.$page) && (filemtime($page_folder.$page) < filemtime($cache_folder.$page)) && (filemtime('index.html') < filemtime($cache_folder.$page))) {
	include($cache_folder.$page);
	echo "<!-- Cached: ".date('H:i', filemtime($cache_folder.$page))." -->";
	exit;
}

// No cached file found, regenerate
ob_start();
$template = file_get_contents('index.html');			// Load the template
$content = file_get_contents($page_folder.$page);		// Get the page
$html = str_replace("{content}", $content, $template);	// Merge the content into the template
echo $html;

$cache = fopen($cache_folder.$page, 'w');				// Open the cached file
fwrite($cache, ob_get_contents());						// Write generated html into the cached file
fclose($fp);											// Close the file
ob_end_flush();											// Send the output to the browser