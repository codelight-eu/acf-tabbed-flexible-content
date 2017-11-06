<?php

/**
 * Partions array according to user specified callback
 */
if (! function_exists ( 'array_partition' )) {
	function array_partition($array, $callback, $recursive = true) {
		$ret = array ();
		$walk = ($recursive) ? 'array_walk_recursive' : 'array_walk';
		
		$walk ( $array, function ($value, $key) use ($callback, &$ret) {
			$index = call_user_func_array ( $callback, array (
					$value,
					$key 
			) );
			if (isset ( $ret [$index] ))
				$ret [$index] [] = $value;
			else
				$ret [$index] = array (
						$value 
				);
		} );
		
		return $ret;
	}
}

/**
 * Remove action/filter by class name
 */
if (! function_exists ( 'remove_filter_by_class' )) {
	function remove_filter_by_class($hook_name = '', $class_name = '', $method_name = '', $priority = 0) {
		global $wp_filter;
		global $wp_action;
		$result = false;
		
		if (! isset ( $wp_filter [$hook_name] ) ||
				! isset ( $wp_filter [$hook_name]->callbacks [$priority] ) || 
				! is_array ( $wp_filter [$hook_name]->callbacks [$priority] ))
			return $result;
			
		// Loop over registered filters 
		foreach ( ( array ) $wp_filter [$hook_name] [$priority] as $unique_id => $filter_array ) {
			// Test if filter is an array
			if (isset ( $filter_array ['function'] ) && is_array ( $filter_array ['function'] )) {
				// Test if object is a class, class and method is equal to param
				if (is_object ( $filter_array ['function'] [0] ) &&
						get_class ( $filter_array ['function'] [0] ) &&
						get_class ( $filter_array ['function'] [0] ) == $class_name &&
						$filter_array ['function'] [1] == $method_name) {
					// Remove
					unset ( $wp_filter [$hook_name]->callbacks [$priority] [$unique_id] );

					$result = true;
				}
			}
		}
		
		return $result;
	}
}
