<?php
namespace ACF_Tabbed_FC_Fields\Fields;

class Flexible_Content extends \acf_field_flexible_content {
	
	public function __construct() {
		// DO NOT CALL parent::__construct()
	}
	
	function render_field( $field ) {
		// Defaults
		if( empty($field['button_label']) )
			$field['button_label'] = $this->defaults['button_label'];
		
		
		// Sort layouts into names
		$layouts = array();
		foreach( $field['layouts'] as $k => $layout )
			$layouts[ $layout['name'] ] = $layout;
		
		// Values
		$ids = array();			
		$values = array ();
		if (! empty ( $field ['value'] )) {
			foreach ( $field ['value'] as $i => $value ) {
				if (empty ( $layouts [$value ['acf_fc_layout']] ))
					continue;
				
					
				array_push ( $ids, uniqid () );
				array_push ( $values, $value );
			}
		}
		
		// Vars
		$div = array(
				'class'		=> 'acf-flexible-content',
				'data-min'	=> $field['min'],
				'data-max'	=> $field['max']
		);

		// No value message
		$no_value_message = __('Click the "%s" button below to start creating your layout','acf');
		$no_value_message = apply_filters('acf/fields/flexible_content/no_value_message',
				$no_value_message, $field);

	?>
	<div <?php \acf_esc_attr_e( $div ); ?>>
		<?php acf_hidden_input(array( 'name' => $field['name'] )); ?>
		
		<div class="no-value-message" <?php if( $field['value'] ){ echo 'style="display:none;"'; } ?>>
			<?php printf( $no_value_message, $field['button_label'] ); ?>
		</div>
		<div class="clones">
			<?php foreach( $layouts as $layout ): ?>
				<?php $this->render_layout( $field, $layout, 'acfcloneindex', array() ); ?>
			<?php endforeach; ?>
		</div>

		<div class="tabs">
			<ul>
			<?php foreach( $values as $i => $value ): ?>
				<?php if(empty($layouts[ $value['acf_fc_layout'] ])) continue; ?>
				<li data-id="tab-<?php echo $field['key'] . '-' . $i . '-' . $ids[$i];  ?>">
					<a href="#tab-<?php echo $field['key'] . '-' . $i. '-' . $ids[$i];  ?>"><?php echo $layouts [$value ['acf_fc_layout']]['label']; ?></a>
				</li>
			<?php endforeach; ?>
			</ul>
			
			<?php foreach( $values as $i => $value ): ?>
			<?php if(empty($layouts[ $value['acf_fc_layout'] ])) continue; ?>
			<div id="tab-<?php echo $field['key'] . '-' . $i. '-' . $ids[$i];  ?>" 
				class="tab" data-layout="<?php echo $layouts [$value ['acf_fc_layout']]['name']; ?>">	
				<?php $this->render_layout ( $field, $layouts [$value ['acf_fc_layout']], $i, $value ); ?>
			</div>
			<?php endforeach; ?>
		</div>
		
		<ul class="acf-actions acf-hl">
			<li>
				<a class="acf-button button button-primary"  href="#" 
					data-event="add-layout"><?php echo $field['button_label']; ?></a>
			</li>
		</ul>
		
		<script type="text-html" class="tmpl-popup">
		<div class="acf-fc-popup">
			<ul>
			<?php foreach( $layouts as $layout ): 
						$atts = array(
							'data-layout'	=> $layout['name'],
							'data-min' 		=> $layout['min'],
							'data-max' 		=> $layout['max'],
						);
				?>
				<li>
					<a href="#" <?php \acf_esc_attr_e( $atts ); ?>><?php echo $layout['label']; ?></a>
				</li>
			<?php endforeach; ?>
			</ul>
		</div>
		</script>
	</div>
	<?php	
	}
	
	function render_layout( $field, $layout, $i, $value ) {	
		// Vars
		$order = 0;
		$el = 'div';
		$sub_fields = $layout['sub_fields'];
		$prefix = $field['name'] . '[' . $i .  ']';

		$div = array (
				'class' => 'layout',
				'data-id' => $i,
				'data-layout' => $layout ['name'] ,
				'data-layout-label' => $layout ['label']
		);
			
		// Collapsed class
		if (\acf_is_row_collapsed ( $field ['key'], $i ))
			$div ['class'] .= ' -collapsed';
			
		// Clone
		if (is_numeric ( $i ))
			$order = $i + 1;
		else
			$div ['class'] .= ' acf-clone';
		
		// Display
		if ($layout ['display'] === 'table')
			$el = 'td';

		// Remove row
		reset_rows();
	?>
		<div <?php \acf_esc_attr_e($div); ?>>
		<?php acf_hidden_input(array( 'name' => $prefix.'[acf_fc_layout]', 'value' => $layout['name'] )); ?>
		
		<?php if( ! empty ( $sub_fields ) ): ?>
			<?php if( $layout['display'] == 'table' ): ?>
			<table class="acf-table">
				<thead>
					<tr>
						<?php foreach( $sub_fields as $sub_field ):
						
						// Prepare field (allow sub fields to be removed)
						$sub_field = acf_prepare_field ( $sub_field );
						
						// Bail ealry if no field
						if (! $sub_field)
							continue;
							
						// Vars
						$atts = array ();
						$atts ['class'] = 'acf-th';
						$atts ['data-name'] = $sub_field ['_name'];
						$atts ['data-type'] = $sub_field ['type'];
						$atts ['data-key'] = $sub_field ['key'];
						
						// Add custom width
						if ($sub_field ['wrapper'] ['width']) {
							$atts ['data-width'] = $sub_field ['wrapper'] ['width'];
							$atts ['style'] = 'width: ' . $sub_field ['wrapper'] ['width'] . '%;';
						}
							
						?>
							<th <?php echo acf_esc_attr( $atts ); ?>>
								<?php echo acf_get_field_label( $sub_field ); ?>
								<?php if( $sub_field['instructions'] ): ?>
									<p class="description"><?php echo $sub_field['instructions']; ?></p>
								<?php endif; ?>
							</th>
						<?php endforeach; ?> 
					</tr>
				</thead>
				
				<tbody>
			<?php else: ?>
			<div class="acf-fields <?php if($layout['display'] == 'row'): ?>-left<?php endif; ?>">
			<?php endif; ?>
			
				<?php
				// Loop though sub fields
				foreach( $sub_fields as $sub_field ) {
					
					// Prevent repeater field from creating multiple conditional logic items for each row
					if( $i !== 'acfcloneindex')
						$sub_field ['conditional_logic'] = 0;
					
					// Add value
					if (isset ( $value [$sub_field ['key']] ) )
						$sub_field ['value'] = $value [$sub_field ['key']];
					elseif (isset ( $sub_field ['default_value'] ) )
						$sub_field ['value'] = $sub_field ['default_value'];
	
					// Update prefix to allow for nested values
					$sub_field ['prefix'] = $prefix;
	
					// Render input
					\acf_render_field_wrap( $sub_field, $el );
				}
				?>
					
				<?php if( $layout['display'] == 'table' ): ?>
				</tbody>
			</table>
				<?php else: ?>
			</div>
				<?php endif; ?>
			<?php endif; ?>
		
			<div class="acf-fc-layout-controlls">
				<a class="acf-icon -minus small" href="#" data-event="remove-layout" title="<?php _e('Remove layout','acf'); ?>"></a>
			</div>
			
		</div>
		<?php	
	}
}
