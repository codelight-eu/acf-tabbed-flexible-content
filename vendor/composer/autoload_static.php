<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInit9a50017baf9c39ff795a761648442792
{
    public static $prefixLengthsPsr4 = array (
        'A' => 
        array (
            'ACF_Tabbed_FC_Fields\\' => 21,
        ),
    );

    public static $prefixDirsPsr4 = array (
        'ACF_Tabbed_FC_Fields\\' => 
        array (
            0 => __DIR__ . '/../..' . '/classes',
        ),
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->prefixLengthsPsr4 = ComposerStaticInit9a50017baf9c39ff795a761648442792::$prefixLengthsPsr4;
            $loader->prefixDirsPsr4 = ComposerStaticInit9a50017baf9c39ff795a761648442792::$prefixDirsPsr4;

        }, null, ClassLoader::class);
    }
}