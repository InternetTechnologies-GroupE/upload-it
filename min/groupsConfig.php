<?php
/**
 * Groups configuration for default Minify implementation
 * @package Minify
 */

/** 
 * You may wish to use the Minify URI Builder app to suggest
 * changes. http://yourdomain/min/builder/
 **/

return array(
	'css' => array('../styles/css/960/960.css', '../styles/css/960/reset.css', '../styles/css/960/text.css', '../styles/css/prettyPhoto.css', '../styles/css/style.css'),
	'js' => array('../js/jquery.prettyPhoto.js', '../js/jquery.cross-slide.js', '../js/upload-it.js')
    // 'js' => array('//js/file1.js', '//js/file2.js'),
    // 'css' => array('//css/file1.css', '//css/file2.css'),

    // custom source example
    /*'js2' => array(
        dirname(__FILE__) . '/../min_unit_tests/_test_files/js/before.js',
        // do NOT process this file
        new Minify_Source(array(
            'filepath' => dirname(__FILE__) . '/../min_unit_tests/_test_files/js/before.js',
            'minifier' => create_function('$a', 'return $a;')
        ))
    ),//*/

    /*'js3' => array(
        dirname(__FILE__) . '/../min_unit_tests/_test_files/js/before.js',
        // do NOT process this file
        new Minify_Source(array(
            'filepath' => dirname(__FILE__) . '/../min_unit_tests/_test_files/js/before.js',
            'minifier' => array('Minify_Packer', 'minify')
        ))
    ),//*/
);